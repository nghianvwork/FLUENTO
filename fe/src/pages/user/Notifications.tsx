import { useEffect, useState } from 'react';
import { Bell, CheckCircle, MailOpen } from 'lucide-react';
import { notificationApi } from '../../services/apiServices';
import { NotificationItem } from '../../types';
import toast from 'react-hot-toast';

export default function Notifications() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        notificationApi.getAll(),
        notificationApi.getUnreadCount(),
      ]);
      setItems(listRes.data.data || []);
      setUnreadCount(countRes.data.data || 0);
    } catch {
      toast.error('Khong tai duoc thong bao');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id);
      setItems((prev) => prev.map(item => (item.id === id ? { ...item, isRead: true } : item)));
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch {
      toast.error('Khong the danh dau da doc');
    }
  };

  const markAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setItems((prev) => prev.map(item => ({ ...item, isRead: true })));
      setUnreadCount(0);
      toast.success('Da danh dau tat ca');
    } catch {
      toast.error('Khong the danh dau tat ca');
    }
  };

  if (loading) {
    return <div className="text-center text-muted" style={{ padding: 80 }}>Dang tai thong bao...</div>;
  }

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <div className="page-title">🔔 Thong bao</div>
          <div className="page-subtitle">Cap nhat tien do, nhac nho va su kien quan trong</div>
        </div>
        <div className="flex gap-8">
          <div className="pill pill-orange" style={{ fontSize: 14 }}>
            {unreadCount} chua doc
          </div>
          <button className="btn btn-secondary btn-sm" onClick={markAllRead}>
            <MailOpen size={14} /> Danh dau tat ca
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card text-center" style={{ padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <div className="text-muted">Chua co thong bao moi.</div>
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          {items.map((item) => (
            <div key={item.id} className="card" style={{ borderLeft: item.isRead ? '4px solid transparent' : '4px solid var(--accent-orange)' }}>
              <div className="flex justify-between items-start">
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
                  <div className="text-sm text-muted" style={{ marginBottom: 8 }}>{item.message}</div>
                  <div className="text-xs text-muted">{new Date(item.createdAt).toLocaleString('vi-VN')}</div>
                </div>
                {!item.isRead && (
                  <button className="btn btn-sm btn-secondary" onClick={() => markAsRead(item.id)}>
                    <CheckCircle size={14} /> Da doc
                  </button>
                )}
                {item.isRead && (
                  <div className="pill pill-green" style={{ fontSize: 12 }}>
                    <Bell size={12} /> Da doc
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
