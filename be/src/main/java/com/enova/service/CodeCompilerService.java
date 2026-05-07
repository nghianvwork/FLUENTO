package com.enova.service;

import com.enova.dto.request.CodeExecutionRequest;
import com.enova.dto.response.CodeExecutionResponse;
import com.enova.exception.ResourceNotFoundException;
import com.enova.model.CodeExecution;
import com.enova.model.User;
import com.enova.repository.CodeExecutionRepository;
import com.enova.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.concurrent.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CodeCompilerService {
    private final CodeExecutionRepository executionRepository;
    private final UserRepository userRepository;
    private final ExecutorService executorService = Executors.newFixedThreadPool(5);

    @Transactional
    public CodeExecutionResponse executeCode(Long userId, CodeExecutionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        CodeExecution execution = CodeExecution.builder()
                .user(user)
                .language(request.getLanguage())
                .code(request.getCode())
                .input(request.getInput())
                .status(CodeExecution.ExecutionStatus.RUNNING)
                .build();

        execution = executionRepository.save(execution);

        try {
            long startTime = System.currentTimeMillis();
            ExecutionResult result = executeCodeByLanguage(request.getLanguage(), request.getCode(), request.getInput());
            long executionTime = System.currentTimeMillis() - startTime;

            execution.setOutput(result.output);
            execution.setError(result.error);
            execution.setExecutionTime((int) executionTime);
            execution.setStatus(result.success ? CodeExecution.ExecutionStatus.SUCCESS : CodeExecution.ExecutionStatus.ERROR);
        } catch (TimeoutException e) {
            execution.setError("Execution timeout (max 10 seconds)");
            execution.setStatus(CodeExecution.ExecutionStatus.TIMEOUT);
        } catch (Exception e) {
            execution.setError("Execution error: " + e.getMessage());
            execution.setStatus(CodeExecution.ExecutionStatus.ERROR);
        }

        execution = executionRepository.save(execution);
        return CodeExecutionResponse.from(execution);
    }

    private ExecutionResult executeCodeByLanguage(String language, String code, String input) throws Exception {
        return switch (language.toLowerCase()) {
            case "python" -> executePython(code, input);
            case "javascript", "js" -> executeJavaScript(code, input);
            case "java" -> executeJava(code, input);
            default -> throw new IllegalArgumentException("Unsupported language: " + language);
        };
    }

    private ExecutionResult executePython(String code, String input) throws Exception {
        Path tempFile = Files.createTempFile("code", ".py");
        try {
            Files.writeString(tempFile, code);
            return executeCommand(new String[]{"python", tempFile.toString()}, input, 10);
        } finally {
            Files.deleteIfExists(tempFile);
        }
    }

    private ExecutionResult executeJavaScript(String code, String input) throws Exception {
        Path tempFile = Files.createTempFile("code", ".js");
        try {
            Files.writeString(tempFile, code);
            return executeCommand(new String[]{"node", tempFile.toString()}, input, 10);
        } finally {
            Files.deleteIfExists(tempFile);
        }
    }

    private ExecutionResult executeJava(String code, String input) throws Exception {
        String className = extractClassName(code);
        Path tempDir = Files.createTempDirectory("java_exec");
        Path javaFile = tempDir.resolve(className + ".java");
        
        try {
            Files.writeString(javaFile, code);
            
            ExecutionResult compileResult = executeCommand(
                new String[]{"javac", javaFile.toString()}, 
                "", 
                10
            );
            
            if (!compileResult.success) {
                return compileResult;
            }
            
            return executeCommand(
                new String[]{"java", "-cp", tempDir.toString(), className}, 
                input, 
                10
            );
        } finally {
            deleteDirectory(tempDir.toFile());
        }
    }

    private String extractClassName(String code) {
        String[] lines = code.split("\n");
        for (String line : lines) {
            if (line.contains("public class")) {
                String[] parts = line.split("\\s+");
                for (int i = 0; i < parts.length - 1; i++) {
                    if (parts[i].equals("class")) {
                        return parts[i + 1].replace("{", "").trim();
                    }
                }
            }
        }
        return "Main";
    }

    private ExecutionResult executeCommand(String[] command, String input, int timeoutSeconds) throws Exception {
        ProcessBuilder pb = new ProcessBuilder(command);
        pb.redirectErrorStream(false);
        
        Process process = pb.start();
        
        if (input != null && !input.isEmpty()) {
            try (OutputStream os = process.getOutputStream()) {
                os.write(input.getBytes());
                os.flush();
            }
        }

        Future<String> outputFuture = executorService.submit(() -> readStream(process.getInputStream()));
        Future<String> errorFuture = executorService.submit(() -> readStream(process.getErrorStream()));

        boolean finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS);
        
        if (!finished) {
            process.destroyForcibly();
            throw new TimeoutException("Execution timeout");
        }

        String output = outputFuture.get(1, TimeUnit.SECONDS);
        String error = errorFuture.get(1, TimeUnit.SECONDS);
        
        return new ExecutionResult(
            process.exitValue() == 0,
            output,
            error
        );
    }

    private String readStream(InputStream is) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is))) {
            return reader.lines().collect(Collectors.joining("\n"));
        }
    }

    private void deleteDirectory(File directory) {
        if (directory.exists()) {
            File[] files = directory.listFiles();
            if (files != null) {
                for (File file : files) {
                    if (file.isDirectory()) {
                        deleteDirectory(file);
                    } else {
                        file.delete();
                    }
                }
            }
            directory.delete();
        }
    }

    public List<CodeExecutionResponse> getUserExecutions(Long userId) {
        return executionRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(CodeExecutionResponse::from)
                .collect(Collectors.toList());
    }

    private static class ExecutionResult {
        boolean success;
        String output;
        String error;

        ExecutionResult(boolean success, String output, String error) {
            this.success = success;
            this.output = output;
            this.error = error;
        }
    }
}
