import React, { useEffect, useState } from 'react';
import api from '../api';
import { FiTrash2, FiPlus, FiImage } from 'react-icons/fi';
import SafeImage from '../components/ui/SafeImage';
import './AdminPortfolios.css';

export default function AdminPortfolios() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/pending');
      // combine portfolios from response
      setItems(Array.isArray(res.data.portfolios) ? res.data.portfolios : []);
    } catch (err) {
      console.error('Erreur chargement portfolios admin', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce portfolio ?')) return;
    try {
      await api.delete(`/admin/portfolio/${id}`);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error('Erreur suppression portfolio', err);
      alert('Erreur suppression');
    }
  };

  const handleAddClick = () => setShowForm(true);
  const handleImageChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setImageFile(f);
    const r = new FileReader();
    r.onload = (ev) => setPreview(ev.target.result);
    r.readAsDataURL(f);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      alert('Image requise');
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('image', imageFile);
      if (title) fd.append('title', title);
      if (description) fd.append('description', description);
      // Endpoint: reuse /portfolio to create as admin (will be pending)
      await api.post('/portfolio', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setShowForm(false);
      setTitle(''); setDescription(''); setImageFile(null); setPreview(null);
      fetchItems();
    } catch (err) {
      console.error('Erreur ajout portfolio', err);
      alert('Erreur ajout');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper admin-portfolios">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Gestion des portfolios</h1>
            <p>Liste des portfolios en base (aperçu, date). Ajouter ou supprimer.</p>
          </div>
          <div>
            <button className="btn btn-primary" onClick={handleAddClick}><FiPlus /> Ajouter un portfolio</button>
          </div>
        </div>

        {showForm && (
          <div className="admin-portfolio-form">
            <form onSubmit={handleAddSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Titre</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Image</label>
                  <input type="file" accept="image/*" onChange={handleImageChange} />
                  {preview && <img src={preview} alt="preview" style={{ maxWidth: 180, marginTop: 8 }} />}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Envoi...' : 'Ajouter'}</button>
              </div>
            </form>
          </div>
        )}

        <div style={{ marginTop: 18 }}>
          {loading ? (
            <div>Chargement...</div>
          ) : items.length === 0 ? (
            <div>Aucun portfolio trouvé.</div>
          ) : (
            <div className="admin-portfolio-list">
              {items.map(item => (
                <div key={item.id} className="admin-portfolio-item">
                  <div className="thumb">
                    <SafeImage src={item.image_url || `http://localhost:8000/storage/${item.image_path}`} alt={item.title || 'img'} />
                  </div>
                  <div className="meta">
                    <div className="title">{item.title || '—'}</div>
                    <div className="date">{new Date(item.created_at).toLocaleString()}</div>
                  </div>
                  <div className="actions">
                    <button className="btn btn-danger" onClick={() => handleDelete(item.id)}><FiTrash2 /> Supprimer</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
