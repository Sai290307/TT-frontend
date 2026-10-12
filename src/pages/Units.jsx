import { useState, useEffect } from 'react';
import { unitApi, buildingApi } from '../services/api';

function UnitIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 22V12h6v10" /></svg>;
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

function UserIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
}

function DoorOpenIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8v4m0 0h.01M21 8v4m0 0h.01M3 12h18M5 8v4a2 2 0 114 0V8M19 8v4a2 2 0 11-4 0V8M10 8v4a2 2 0 11-4 0V8" /></svg>;
}

export default function Units() {
  const [units, setUnits] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [formData, setFormData] = useState({
    unitNumber: '',
    buildingId: '',
    floorNumber: 1,
    unitType: '2BHK',
    areaSqft: '',
    monthlyMaintenance: '',
    status: 'VACANT',
  });
  const [submitting, setSubmitting] = useState(false);
  const [filterBuildingId, setFilterBuildingId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [unitsRes, buildingsRes] = await Promise.all([
        unitApi.getAll(),
        buildingApi.getAll(),
      ]);
      setUnits(unitsRes.data);
      setBuildings(buildingsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUnits = filterBuildingId 
    ? units.filter(u => u.buildingId === parseInt(filterBuildingId))
    : units;

  const handleOpenModal = (unit = null) => {
    if (unit) {
      setEditingUnit(unit);
      setFormData({
        unitNumber: unit.unitNumber,
        buildingId: unit.buildingId?.toString() || '',
        floorNumber: unit.floorNumber,
        unitType: unit.unitType,
        areaSqft: unit.areaSqft?.toString() || '',
        monthlyMaintenance: unit.monthlyMaintenance?.toString() || '',
        status: unit.status,
      });
    } else {
      setEditingUnit(null);
      setFormData({
        unitNumber: '',
        buildingId: '',
        floorNumber: 1,
        unitType: '2BHK',
        areaSqft: '',
        monthlyMaintenance: '',
        status: 'VACANT',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUnit(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = {
        unitNumber: formData.unitNumber,
        buildingId: parseInt(formData.buildingId),
        floorNumber: parseInt(formData.floorNumber),
        unitType: formData.unitType,
        areaSqft: formData.areaSqft ? parseFloat(formData.areaSqft) : null,
        monthlyMaintenance: formData.monthlyMaintenance ? parseFloat(formData.monthlyMaintenance) : null,
        status: formData.status,
      };

      if (editingUnit) {
        await unitApi.update(editingUnit.id, data);
      } else {
        await unitApi.create(data);
      }

      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error('Failed to save unit:', error);
      alert(error.response?.data?.message || 'Failed to save unit');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this unit?')) return;

    try {
      await unitApi.delete(id);
      fetchData();
    } catch (error) {
      console.error('Failed to delete unit:', error);
      alert(error.response?.data?.message || 'Failed to delete unit');
    }
  };

  const handleVacate = async (id) => {
    if (!window.confirm('Are you sure you want to vacate this unit?')) return;

    try {
      await unitApi.vacate(id);
      fetchData();
    } catch (error) {
      console.error('Failed to vacate unit:', error);
      alert(error.response?.data?.message || 'Failed to vacate unit');
    }
  };

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
          <h1 className="page-title">Units</h1>
          <p className="page-subtitle">Manage apartment units and residents</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <PlusIcon className="w-4 h-4" />
          Add Unit
        </button>
      </div>

      {/* Building Filter */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Filter by Building:</label>
            <select
              className="form-input w-auto"
              value={filterBuildingId}
              onChange={(e) => setFilterBuildingId(e.target.value)}
            >
              <option value="">All Buildings</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <span className="text-sm text-gray-500">
              {filteredUnits.length} of {units.length} units
            </span>
          </div>
        </div>
      </div>

      <div className="cards">
        {filteredUnits.map((unit) => (
          <div key={unit.id} className="card hover:shadow-md transition-shadow">
            <div className="card-header flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`stat-icon ${unit.status === 'OCCUPIED' ? 'stat-icon-green' : 'stat-icon-orange'}`}>
                  <UnitIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Unit {unit.unitNumber}</h3>
                  <p className="text-sm text-gray-500">Floor {unit.floorNumber} • {unit.unitType}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenModal(unit)}
                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                  title="Edit"
                >
                  <EditIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(unit.id)}
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                  title="Delete"
                >
                  <DeleteIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="grid grid-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium">{unit.unitType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Floor</p>
                  <p className="font-medium">{unit.floorNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Area</p>
                  <p className="font-medium">{unit.areaSqft ? `${unit.areaSqft} sq ft` : 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Maintenance</p>
                  <p className="font-medium">₹{unit.monthlyMaintenance ? unit.monthlyMaintenance.toLocaleString() : 'Not set'}/month</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className={`badge ${unit.status === 'OCCUPIED' ? 'badge-success' : unit.status === 'VACANT' ? 'badge-warning' : 'badge-info'}`}>
                  {unit.status}
                </span>
                <span className="badge badge-info">{unit.buildingId ? `Building ${unit.buildingId}` : 'No building'}</span>
              </div>
              {unit.status === 'OCCUPIED' ? (
                <button
                  onClick={() => handleVacate(unit.id)}
                  className="btn btn-secondary btn-sm w-full"
                >
                  <DoorOpenIcon className="w-4 h-4" />
                  Vacate Unit
                </button>
              ) : (
                <button
                  onClick={() => handleOpenModal(unit)}
                  className="btn btn-primary btn-sm w-full"
                >
                  <UserIcon className="w-4 h-4" />
                  Assign Resident
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredUnits.length === 0 && !loading && (
        <div className="card text-center py-16">
          <UnitIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No units found</h3>
          <p className="text-gray-500 mb-6">Create your first unit to get started</p>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <PlusIcon className="w-4 h-4" />
            Create Unit
          </button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="font-semibold text-lg">
                {editingUnit ? 'Edit Unit' : 'Add Unit'}
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
                  <label htmlFor="unitNumber" className="form-label">Unit Number *</label>
                  <input
                    type="text"
                    id="unitNumber"
                    className="form-input"
                    value={formData.unitNumber}
                    onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                    placeholder="A-101"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="buildingId" className="form-label">Building *</label>
                  <select
                    id="buildingId"
                    className="form-input"
                    value={formData.buildingId}
                    onChange={(e) => setFormData({ ...formData, buildingId: e.target.value })}
                    required
                  >
                    <option value="">Select Building</option>
                    {buildings.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="floorNumber" className="form-label">Floor Number *</label>
                    <input
                      type="number"
                      id="floorNumber"
                      className="form-input"
                      value={formData.floorNumber}
                      onChange={(e) => setFormData({ ...formData, floorNumber: parseInt(e.target.value) || 1 })}
                      min="1"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="unitType" className="form-label">Unit Type *</label>
                    <select
                      id="unitType"
                      className="form-input"
                      value={formData.unitType}
                      onChange={(e) => setFormData({ ...formData, unitType: e.target.value })}
                      required
                    >
                      <option value="1BHK">1 BHK</option>
                      <option value="2BHK">2 BHK</option>
                      <option value="3BHK">3 BHK</option>
                      <option value="4BHK">4 BHK</option>
                      <option value="STUDIO">Studio</option>
                      <option value="PENTHOUSE">Penthouse</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="areaSqft" className="form-label">Area (sq ft)</label>
                    <input
                      type="number"
                      id="areaSqft"
                      className="form-input"
                      value={formData.areaSqft}
                      onChange={(e) => setFormData({ ...formData, areaSqft: e.target.value })}
                      placeholder="950"
                      step="0.1"
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="monthlyMaintenance" className="form-label">Monthly Maintenance (₹)</label>
                    <input
                      type="number"
                      id="monthlyMaintenance"
                      className="form-input"
                      value={formData.monthlyMaintenance}
                      onChange={(e) => setFormData({ ...formData, monthlyMaintenance: e.target.value })}
                      placeholder="3000"
                      step="0.1"
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="status" className="form-label">Status</label>
                  <select
                    id="status"
                    className="form-input"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="VACANT">Vacant</option>
                    <option value="OCCUPIED">Occupied</option>
                    <option value="MAINTENANCE">Under Maintenance</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : (editingUnit ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}