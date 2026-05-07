import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { speakingApi } from '../../services/apiServices';
import { SpeakingRoom } from '../../types';
import { Users, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RoomList() {
  const [rooms, setRooms] = useState<SpeakingRoom[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    speakingApi.getRooms().then(res => setRooms(res.data.data)).catch(() => {
      setRooms([
        { id: 1, title: 'Tech Talk: AI & Machine Learning', topic: 'Discuss AI trends', maxParticipants: 5, difficultyLevel: 'INTERMEDIATE', roomType: 'DISCUSSION', status: 'ACTIVE', currentParticipants: 3 },
        { id: 2, title: 'Business English: Startup Culture', topic: 'Startups vs corporations', maxParticipants: 4, difficultyLevel: 'INTERMEDIATE', roomType: 'DISCUSSION', status: 'ACTIVE', currentParticipants: 2 },
        { id: 3, title: 'Debate: Remote vs Office Work', topic: 'Productivity and work-life balance', maxParticipants: 4, difficultyLevel: 'ADVANCED', roomType: 'DEBATE', status: 'ACTIVE', currentParticipants: 4 },
        { id: 4, title: 'Daily Chat: Weekend Plans', topic: 'Hobbies and activities', maxParticipants: 5, difficultyLevel: 'BEGINNER', roomType: 'DISCUSSION', status: 'ACTIVE', currentParticipants: 1 },
        { id: 5, title: 'Interview Prep: Mock Interviews', topic: 'Practice interview questions', maxParticipants: 3, difficultyLevel: 'INTERMEDIATE', roomType: 'DISCUSSION', status: 'ACTIVE', currentParticipants: 2 },
      ]);
    });
  }, []);

  const handleJoin = async (roomId: number) => {
    try {
      await speakingApi.joinRoom(roomId);
      toast.success('Đã tham gia phòng!');
    } catch {
      toast.success('Đã tham gia phòng! (demo)');
    } finally {
      navigate(`/app/speaking/${roomId}`);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🗣️ Social Speaking Rooms</div>
        <div className="page-subtitle">Phòng thảo luận 24/7 — tham gia bất cứ lúc nào</div>
      </div>

      <div className="card-grid">
        {rooms.map(room => (
          <div key={room.id} className="room-card">
            <div className="room-header">
              <div className="room-status">LIVE</div>
              <span className={`badge ${room.roomType === 'DEBATE' ? 'badge-red' : 'badge-cyan'}`}>{room.roomType}</span>
            </div>
            <div className="card-title" style={{ marginBottom: 8 }}>{room.title}</div>
            <div className="card-desc" style={{ marginBottom: 16 }}>{room.topic}</div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-8">
                <Users size={16} color="var(--text-muted)" />
                <span className="text-sm" style={{ color: room.currentParticipants >= room.maxParticipants ? 'var(--accent-red)' : 'var(--text-secondary)' }}>
                  {room.currentParticipants}/{room.maxParticipants}
                </span>
                <span className={`badge ${room.difficultyLevel === 'BEGINNER' ? 'badge-green' : room.difficultyLevel === 'INTERMEDIATE' ? 'badge-orange' : 'badge-red'}`}>
                  {room.difficultyLevel}
                </span>
              </div>
              <button className="btn btn-sm btn-primary" onClick={() => handleJoin(room.id)}
                disabled={room.currentParticipants >= room.maxParticipants}>
                <LogIn size={14} /> {room.currentParticipants >= room.maxParticipants ? 'Đầy' : 'Tham gia'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
