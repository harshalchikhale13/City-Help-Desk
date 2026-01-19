/**
 * Similar Complaints Panel Component
 * Shows duplicate and similar complaints for comparison
 */

import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, LoadingSpinner, Alert } from './UIComponents';
import api from '../services/api';
import './SimilarComplaintsPanel.css';

const SimilarComplaintsPanel = ({ complaint, onClose }) => {
  const [similar, setSimilar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [merging, setMerging] = useState(false);

  useEffect(() => {
    fetchSimilar();
  }, [complaint]);

  const fetchSimilar = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/complaints/duplicates/${complaint.id}`);
      setSimilar(res.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch similar complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleMergeDuplicates = async (duplicateIds) => {
    if (!window.confirm(`Merge ${duplicateIds.length} duplicate complaints?`)) {
      return;
    }

    setMerging(true);
    try {
      await api.post('/admin/complaints/merge-duplicates', {
        mainComplaintId: complaint.id,
        duplicateIds: duplicateIds
      });
      alert('Complaints merged successfully');
      onClose();
    } catch (err) {
      alert('Failed to merge complaints: ' + err.message);
    } finally {
      setMerging(false);
    }
  };

  if (loading) {
    return (
      <div className="similar-complaints-panel">
        <div className="panel-header">
          <h3>Checking for Similar Complaints...</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <LoadingSpinner message="Analyzing complaint..." />
      </div>
    );
  }

  return (
    <div className="similar-complaints-panel">
      <div className="panel-header">
        <h3>Duplicate Analysis for Complaint #{complaint.id}</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      <div className="panel-content">
        {/* Main Complaint */}
        <Card className="main-complaint">
          <h4>Current Complaint (MAIN)</h4>
          <div className="complaint-details">
            <p><strong>Title:</strong> {complaint.title}</p>
            <p><strong>Description:</strong> {complaint.description.substring(0, 100)}...</p>
            <div className="complaint-badges">
              <Badge>{complaint.category}</Badge>
              <Badge variant={`priority-${complaint.priority}`}>{complaint.priority}</Badge>
            </div>
          </div>
        </Card>

        {/* Analysis Result */}
        <div className="analysis-result">
          {similar.hasDuplicates ? (
            <Alert type="error">
              <strong>Warning:</strong> {similar.duplicates.length} potential duplicate(s) found!
            </Alert>
          ) : similar.totalSimilar > 0 ? (
            <Alert type="warning">
              <strong>Info:</strong> {similar.totalSimilar} similar complaint(s) found.
            </Alert>
          ) : (
            <Alert type="success">
              <strong>Good:</strong> No duplicates or similar complaints found.
            </Alert>
          )}

          <p className="recommendation">{similar.recommendation}</p>
        </div>

        {/* Similar Complaints List */}
        {similar.similar && similar.similar.length > 0 && (
          <div className="similar-list">
            <h4>Similar Complaints</h4>
            {similar.similar.map(comp => (
              <Card key={comp.id} className="similar-item">
                <div className="similarity-header">
                  <span className={`similarity-badge ${comp.isDuplicate ? 'duplicate' : 'similar'}`}>
                    {comp.isDuplicate ? 'DUPLICATE' : 'SIMILAR'} - {comp.similarity}%
                  </span>
                </div>
                <div className="complaint-preview">
                  <p><strong>ID:</strong> #{comp.id}</p>
                  <p><strong>Title:</strong> {comp.title}</p>
                  <p><strong>Category:</strong> {comp.category}</p>
                  <p><strong>Status:</strong> {comp.status}</p>
                  <p><strong>Filed:</strong> {new Date(comp.createdAt).toLocaleDateString()}</p>
                </div>
              </Card>
            ))}

            {similar.hasDuplicates && (
              <div className="merge-action">
                <Button
                  variant="danger"
                  onClick={() => handleMergeDuplicates(similar.duplicates.map(c => c.id))}
                  disabled={merging}
                >
                  {merging ? 'Merging...' : 'Merge Duplicates'}
                </Button>
              </div>
            )}
          </div>
        )}

        {!similar.similar || similar.similar.length === 0 && (
          <div className="no-results">
            <p>No similar complaints found for this complaint.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimilarComplaintsPanel;
