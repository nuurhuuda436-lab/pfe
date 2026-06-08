import React, { useState, useEffect, useRef } from "react";
import { FiSend, FiMessageSquare, FiUser, FiHelpCircle } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import api from '../api';
import SafeImage from '../components/ui/SafeImage';
import ContactAdminModal from '../components/ui/ContactAdminModal';
import './Messages.css';

export default function Messages({ user }) {
  const { t, i18n } = useTranslation();
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showContactAdmin, setShowContactAdmin] = useState(false);
  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/conversations');
      setConversations(res.data);
    } catch (err) {
      console.error("Erreur de chargement des conversations", err);
    }
  };

  const fetchMessages = async (convId) => {
    if (!convId) return;
    try {
      const res = await api.get(`/conversations/${convId}/messages`);
      setMessages(res.data);
      setConversations(prev => prev.map(c =>
        c.id === convId ? { ...c, unread_count: 0 } : c
      ));
    } catch (err) {
      console.error("Erreur de chargement des messages", err);
    }
  };

  useEffect(() => {
    fetchConversations();
    const convInterval = setInterval(fetchConversations, 5000);
    return () => clearInterval(convInterval);
  }, []);

  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId);
      pollingRef.current = setInterval(() => {
        fetchMessages(activeConvId);
      }, 3000);
    } else {
      setMessages([]);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeConvId) return;
    try {
      const res = await api.post(`/conversations/${activeConvId}/messages`, { text });
      setMessages([...messages, res.data]);
      setText("");
      fetchConversations();
    } catch (err) {
      console.error("Erreur lors de l'envoi", err);
    }
  };

  const activeConv = conversations.find(c => c.id === activeConvId);
  const isFrench = i18n.language === 'fr';

  return (
    <div className="page-wrapper" style={{ paddingTop: 'var(--space-4)', paddingBottom: 'var(--space-4)' }}>
      <div className="container" style={{ maxWidth: '1000px', height: '100%' }}>
        <div className="chat-layout animate-in">
          <div className="chat-sidebar">
            <div className="chat-sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><FiMessageSquare /> {t('messages.title')}</div>
            </div>
            
            <div className="chat-sidebar-list">
              {conversations.length === 0 ? (
                <div className="chat-empty-state" style={{ padding: 'var(--space-6)', fontSize: 'var(--font-size-sm)' }}>
                  {t('messages.no_conversations')}
                </div>
              ) : (
                conversations.map(conv => (
                  <div
                    key={conv.id}
                    className={`chat-conv-item${activeConvId === conv.id ? ' active' : ''}`}
                    onClick={() => setActiveConvId(conv.id)}
                  >
                    <div className="chat-conv-avatar">
                      {conv.other_user.photo_url ? (
                        <SafeImage src={conv.other_user.photo_url} alt="" />
                      ) : (
                        <FiUser />
                      )}
                    </div>
                    <div className="chat-conv-body">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                        <span className="chat-conv-name">{conv.other_user.nom}</span>
                        {conv.unread_count > 0 && (
                          <span className="chat-unread-badge">{conv.unread_count}</span>
                        )}
                      </div>
                      <div className="chat-conv-offre">{t('messages.offer_label')} {conv.offre_titre}</div>
                      <div className="chat-conv-preview">{conv.last_message}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {user?.role !== 'admin' && (
              <div style={{ padding: '15px', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
                <button 
                  className="btn btn-outline btn-block" 
                  style={{ fontSize: '13px', padding: '8px' }}
                  onClick={() => setShowContactAdmin(true)}
                >
                  <FiHelpCircle /> {t('messages.contact_admin_btn')}
                </button>
              </div>
            )}
          </div>

          <div className="chat-main">
            {activeConvId ? (
              <>
                <div className="chat-main-header">
                  <div className="chat-conv-avatar">
                    {activeConv?.other_user.photo_url ? (
                      <SafeImage src={activeConv.other_user.photo_url} alt="" />
                    ) : (
                      <FiUser />
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-lg)' }}>
                      {activeConv?.other_user.nom}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                      {t('messages.offer_label')} {activeConv?.offre_titre}
                    </div>
                  </div>
                </div>

                <div className="chat-messages-area">
                  {messages.length === 0 ? (
                    <div className="chat-empty-state">{t('messages.say_hello')}</div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`chat-bubble-wrap ${msg.is_mine ? 'mine' : 'other'}`}
                      >
                        <div className={`chat-bubble ${msg.is_mine ? 'mine' : 'other'}`}>
                          {msg.text}
                        </div>
                        <div className="chat-bubble-time">
                          {new Date(msg.created_at).toLocaleTimeString(isFrench ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                          {msg.is_mine && (
                            <span style={{ marginLeft: '5px', color: msg.is_read ? 'var(--color-primary)' : 'inherit' }}>
                              {msg.is_read ? ` ✓✓ (${t('messages.read_tick')})` : ` ✓ (${t('messages.sent_tick')})`}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form className="chat-input-area" onSubmit={sendMessage}>
                  <input
                    type="text"
                    className="form-input"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={t('messages.message_placeholder')}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary chat-send-btn"
                    disabled={!text.trim()}
                  >
                    <FiSend />
                  </button>
                </form>
              </>
            ) : (
              <div className="chat-placeholder">
                <FiMessageSquare size={48} style={{ opacity: 0.4 }} />
                <p>{t('messages.select_conversation')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showContactAdmin && (
        <ContactAdminModal 
          isOpen={showContactAdmin} 
          onClose={() => setShowContactAdmin(false)} 
          user={user} 
        />
      )}
    </div>
  );
}
