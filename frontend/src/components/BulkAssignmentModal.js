/**
 * Bulk Assignment Modal Component
 * Modal for assigning multiple complaints to officers
 */

import React, { useState } from 'react';
import { Button, Modal } from './UIComponents';
import './BulkAssignmentModal.css';

const BulkAssignmentModal = ({ officers, complaintCount, onAssign, onClose }) => {
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAssign = async () => {
    if (!selectedOfficer) {
      alert('Please select an officer');
      return;
    }

    setLoading(true);
    try {
      await onAssign(selectedOfficer);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose}>
      <div className="bulk-assignment-modal">
        <h2>Assign {complaintCount} Complaints</h2>
        
        <p className="info-text">
          Select an officer to assign {complaintCount} selected complaints
        </p>

        <div className="officer-selection">
          <label htmlFor="officer-select">Select Officer:</label>
          <select
            id="officer-select"
            value={selectedOfficer}
            onChange={(e) => setSelectedOfficer(e.target.value)}
            className="officer-select"
            disabled={loading}
          >
            <option value="">-- Choose an Officer --</option>
            {officers.map(officer => (
              <option key={officer.id} value={officer.id}>
                {officer.name} ({officer.department}) - {officer.totalAssigned} assigned
              </option>
            ))}
          </select>
        </div>

        {selectedOfficer && (
          <div className="officer-info">
            {(() => {
              const officer = officers.find(o => o.id === selectedOfficer);
              return (
                <div>
                  <h4>{officer.name}</h4>
                  <p><strong>Department:</strong> {officer.department}</p>
                  <p><strong>Currently Assigned:</strong> {officer.totalAssigned}</p>
                  <p><strong>Resolution Rate:</strong> {officer.resolutionRate}%</p>
                </div>
              );
            })()}
          </div>
        )}

        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAssign} disabled={!selectedOfficer || loading}>
            {loading ? 'Assigning...' : 'Assign Complaints'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default BulkAssignmentModal;
