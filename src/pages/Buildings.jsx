import { useState, useEffect } from 'react';
import { buildingApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

function BuildingIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
}

function PlusIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
}

function EditIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>;
}

function DeleteIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
}

function UnitIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 22V12h6v10" /></svg>;
}

export default function Buildings() {
  const { hasRole } = useAuth();
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    totalFloors: 0,
    totalUnits: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      const res = await buildingApi.getAll();
      setBuildings(res.data);
    } catch (error) {
      console.error('Failed to fetch buildings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (building = null) => {
    if (building) {
      setEditingBuilding(building);
      setFormData({
        name: building.name,
        address: building.address,
        totalFloors: building.totalFloors,
        totalUnits: building.totalUnits,
      });
    } else {
      setEditingBuilding(null);
      setFormData({
        name: '',
        address: '',
        totalFloors: 0,
        totalUnits: 0,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBuilding(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingBuilding) {
        await buildingApi.update(editingBuilding.id, formData);
      } else {
        await buildingApi.create(formData);
      }

      handleCloseModal();
      fetchBuildings();
    } catch (error) {
      console.error('Failed to save building:', error);
      alert(error.response?.data?.message || 'Failed to save building');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this building?')) return;

    try {
      await buildingApi.delete(id);
      fetchBuildings();
    } catch (error) {
      console.error('Failed to delete building:', error);
      alert(error.response?.data?.message || 'Failed to delete building');
    }
  };

  const canManage = hasRole(['ADMIN', 'MANAGER']);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header flex justify-between items-end">
        <div>
          <h1 className="page-title">Buildings</h1>
          <p className="page-subtitle">Manage apartment buildings and complexes</p>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <PlusIcon className="w-4 h-4" />
            Add Building
          </button>
        )}
      </div>

      <div className="cards">
        {buildings.map((building) => (
          <div key={building.id} className="card hover:shadow-md transition-shadow">
            <div className="card-header flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="stat-icon stat-icon-blue">
                  <BuildingIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{building.name}</h3>
                  <p className="text-sm text-gray-500">{building.address}</p>
                </div>
              </div>
              {canManage && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenModal(building)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit"
                  >
                    <EditIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(building.id)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <DeleteIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="card-body">
              <div className="grid grid-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Total Floors</p>
                  <p className="font-medium">{building.totalFloors}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Units</p>
                  <p className="font-medium">{building.totalUnits}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium">{building.createdAt ? new Date(building.createdAt).toLocaleDateString() : '-'}</p>
                </div>
              </div>
              <button
                onClick={() => window.location.href = `/units?buildingId=${building.id}`}
                className="btn btn-secondary btn-sm w-full"
              >
                <UnitIcon className="w-4 h-4" />
                View Units
              </button>
            </div>
          </div>
        ))}
      </div>

      {buildings.length === 0 && !loading && (
        <div className="card text-center py-16">
          <BuildingIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No buildings yet</h3>
          <p className="text-gray-500 mb-6">Create your first building to get started</p>
          {canManage && (
            <button className="btn btn-primary" onClick={() => handleOpenModal()}>
              <PlusIcon className="w-4 h-4" />
              Create Building
            </button>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="font-semibold text-lg">
                {editingBuilding ? 'Edit Building' : 'Add Building'}
              </h3>
              <button onClick={handleCloseModal} className="p-1 text-gray-500 hover:text-gray-700">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Name *</label>
                  <input
                    type="text"
                    id="name"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Green Valley Apartments"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address" className="form-label">Address *</label>
                  <input
                    type="text"
                    id="address"
                    className="form-input"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Main Street, Springfield"
                    required
                  />
                </div>

                <div className="grid grid-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="totalFloors" className="form-label">Total Floors *</label>
                    <input
                      type="number"
                      id="totalFloors"
                      className="form-input"
                      value={formData.totalFloors}
                      onChange={(e) => setFormData({ ...formData, totalFloors: parseInt(e.target.value) || 0 })}
                      min="1"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="totalUnits" className="form-label">Total Units *</label>
                    <input
                      type="number"
                      id="totalUnits"
                      className="form-input"
                      value={formData.totalUnits}
                      onChange={(e) => setFormData({ ...formData, totalUnits: parseInt(e.target.value) || 0 })}
                      min="1"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : (editingBuilding ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}