import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Phone, Mail, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import ClientModal from '../components/ClientModal';
import axios from 'axios';
axios.defaults.withCredentials = true;

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    const filtered = clients.filter(client =>
      (client?.companyName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (client?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (client?.phone || '').includes(searchTerm)
    );
    setFilteredClients(filtered);
  }, [clients, searchTerm]);

  const fetchClients = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/users/clients`);
      console.log(response)
      setClients(response.data.clients);
    } catch (error) {
      toast.error('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClient = async (clientData) => {
    try {
      if (editingClient) {
        await axios.patch(`${BASE_URL}/users/edit-client/${editingClient._id}`, clientData);
        toast.success('Client updated successfully');
      } else {
        await axios.post(`${BASE_URL}/users/add-client`, clientData);
        toast.success('Client created successfully');
      }
      fetchClients();
      setIsModalOpen(false);
      setEditingClient(null);
    } catch (error) {
      toast.error('Failed to save client');
    }
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleDeleteClient = async (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await axios.delete(`${BASE_URL}/users/delete-client/${clientId}`);
        toast.success('Client deleted successfully');
        fetchClients();
      } catch (error) {
        toast.error('Failed to delete client');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500" style={{ marginTop: '0.25rem' }}>
            Manage your client database
          </p>
        </div>
        <div style={{ marginTop: '1rem' }} className="sm:mt-0">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            style={{ paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
          >
            <Plus className="h-4 w-4" style={{ marginRight: '0.5rem' }} />
            Add Client
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative" style={{ marginTop: '1.5rem' }}>
        <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none" style={{paddingLeft: '12px'}}>
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search clients..."
          className="block w-full border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          style={{ paddingLeft: '2.5rem', paddingRight: '0.75rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Clients Grid */}
      {filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" style={{ marginTop: '1.5rem' }}>
          {filteredClients.map((client) => (
            <div key={client._id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
              <div className="sm:p-6" style={{ padding: '1.25rem' }}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">{client.companyName}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditClient(client)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client._id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: '1rem' }} className="flex flex-col gap-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4" style={{ marginRight: '0.5rem' }} />
                    {client.phone}
                  </div>
                  {client.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4" style={{ marginRight: '0.5rem' }} />
                      {client.email}
                    </div>
                  )}
                </div>

                {client.address && (
                  <div className="text-sm text-gray-500" style={{ marginTop: '0.75rem' }}>
                    {client.address.street && <p>{client.address.street}</p>}
                    {(client.address.city || client.address.state) && (
                      <p>
                        {client.address.city}
                        {client.address.city && client.address.state && ', '}
                        {client.address.state}
                        {client.address.zipCode && ` ${client.address.zipCode}`}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
          <div className="text-gray-400" style={{ width: '3rem', height: '3rem', marginLeft: 'auto', marginRight: 'auto' }}>
            <Users className="h-12 w-12" />
          </div>
          <h3 className="text-sm font-medium text-gray-900" style={{ marginTop: '0.5rem' }}>No clients found</h3>
          <p className="text-sm text-gray-500" style={{ marginTop: '0.25rem' }}>
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new client.'}
          </p>
          {!searchTerm && (
            <div style={{ marginTop: '1.5rem' }}>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                style={{ paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
              >
                <Plus className="h-4 w-4" style={{ marginRight: '0.5rem' }} />
                Add Client
              </button>
            </div>
          )}
        </div>
      )}

      {/* Client Modal */}
      <ClientModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingClient(null);
        }}
        handleSaveClient={handleSaveClient}
        client={editingClient}
      />
    </div>
  );
};

export default Clients;
