import React, { useEffect, useState } from 'react';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Heart,
  Check,
  AlertCircle,
  ShieldCheck,
  X
} from 'lucide-react';
import { api } from '../services/api';

export const ContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRelationship, setFormRelationship] = useState('Partner');
  const [formChannels, setFormChannels] = useState(['SMS', 'In-App']);
  const [formIsActive, setFormIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const data = await api.getContacts();
      setContacts(data);
    } catch (err) {
      setError(err.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingContact(null);
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormRelationship('Family');
    setFormChannels(['SMS', 'In-App']);
    setFormIsActive(true);
    setIsModalOpen(true);
    setError(null);
  };

  const openEditModal = (contact) => {
    setEditingContact(contact);
    setFormName(contact.name);
    setFormPhone(contact.phone);
    setFormEmail(contact.email);
    setFormRelationship(contact.relationship);
    setFormChannels(contact.notificationChannels);
    setFormIsActive(contact.isActive);
    setIsModalOpen(true);
    setError(null);
  };

  const handleChannelToggle = (channel) => {
    if (formChannels.includes(channel)) {
      if (formChannels.length === 1) {
        setError('At least one notification channel must be enabled');
        return;
      }
      setFormChannels(formChannels.filter((c) => c !== channel));
    } else {
      setFormChannels([...formChannels, channel]);
    }
  };

  const handleSaveContact = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (editingContact) {
        const updated = await api.updateContact(editingContact.id, {
          name: formName,
          phone: formPhone,
          email: formEmail,
          relationship: formRelationship,
          notificationChannels: formChannels,
          isActive: formIsActive,
        });
        setContacts(contacts.map((c) => (c.id === updated.id ? updated : c)));
        setSuccess(`Contact "${updated.name}" updated successfully.`);
      } else {
        const created = await api.createContact({
          name: formName,
          phone: formPhone,
          email: formEmail,
          relationship: formRelationship,
          notificationChannels: formChannels,
          isActive: formIsActive,
        });
        setContacts([created, ...contacts]);
        setSuccess(`Contact "${created.name}" added to emergency list.`);
      }
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to save contact');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteContact = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from your trusted emergency contacts?`)) {
      return;
    }

    try {
      await api.deleteContact(id);
      setContacts(contacts.filter((c) => c.id !== id));
      setSuccess(`Contact "${name}" deleted.`);
    } catch (err) {
      setError(err.message || 'Failed to delete contact');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center space-x-2">
            <Users className="w-6 h-6 text-[#0f4c5c]" />
            <span>Emergency Contacts</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            People who are immediately notified with your coordinates when you trigger Silent SOS.
          </p>
        </div>

        <button
          type="button"
          id="btn-add-contact-open"
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#0f4c5c] hover:bg-[#0a3641] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Trusted Contact</span>
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="text-xs text-emerald-600 font-bold ml-2">
            ×
          </button>
        </div>
      )}

      {/* Contact Cards List */}
      {loading ? (
        <div className="py-12 text-center text-gray-400 text-sm">
          Loading contacts...
        </div>
      ) : contacts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-xs max-w-lg mx-auto">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-base font-bold text-gray-800">No emergency contacts added yet</h2>
          <p className="text-xs text-gray-500 mt-1 mb-6">
            Add at least one family member, partner, or close friend so they can be silently alerted during an emergency.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-[#2a9d8f] hover:bg-[#238276] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Contact</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={`bg-white rounded-xl p-5 border transition-all ${
                contact.isActive
                  ? 'border-gray-200 shadow-xs hover:border-teal-300'
                  : 'border-gray-200 bg-gray-50/60 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-bold text-gray-900">{contact.name}</h2>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-teal-50 text-[#0f4c5c] border border-teal-100">
                      {contact.relationship}
                    </span>
                    {!contact.isActive && (
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-gray-200 text-gray-600">
                        Inactive
                      </span>
                    )}
                  </div>

                  <div className="mt-2.5 space-y-1.5 text-xs text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-mono">{contact.phone}</span>
                    </div>
                    {contact.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <span>{contact.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(contact)}
                    title="Edit contact"
                    className="p-1.5 text-gray-400 hover:text-teal-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteContact(contact.id, contact.name)}
                    title="Delete contact"
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Notification Channel Badges */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] text-gray-400">Dispatch Channels:</span>
                <div className="flex items-center space-x-1.5">
                  {contact.notificationChannels.map((channel) => (
                    <span
                      key={channel}
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-teal-50 text-[#0f4c5c] border border-teal-200"
                    >
                      {channel}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Contact Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {editingContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Sarah Connor"
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4c5c] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Phone (SMS)
                  </label>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+1 555 432 1098"
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4c5c] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Relationship
                  </label>
                  <select
                    value={formRelationship}
                    onChange={(e) => setFormRelationship(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4c5c] focus:bg-white"
                  >
                    <option value="Partner">Partner</option>
                    <option value="Family">Family / Parent</option>
                    <option value="Sister">Sister</option>
                    <option value="Brother">Brother</option>
                    <option value="Friend">Close Friend</option>
                    <option value="Colleague">Colleague</option>
                    <option value="Neighbor">Neighbor</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email Address (for Emergency Email dispatch)
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="sarah@example.com"
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4c5c] focus:bg-white"
                />
              </div>

              {/* Notification Channels checkboxes */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Notification Channels
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['SMS', 'Email', 'In-App'].map((ch) => {
                    const isSelected = formChannels.includes(ch);
                    return (
                      <button
                        type="button"
                        key={ch}
                        onClick={() => handleChannelToggle(ch)}
                        className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                          isSelected
                            ? 'bg-teal-50 border-[#0f4c5c] text-[#0f4c5c]'
                            : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        <span>{ch}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="pt-2 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="contact-is-active"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="h-4 w-4 text-[#0f4c5c] focus:ring-[#0f4c5c] border-gray-300 rounded"
                />
                <label htmlFor="contact-is-active" className="text-xs text-gray-700 font-medium">
                  Active (Receive immediate notifications when Silent SOS is triggered)
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#0f4c5c] hover:bg-[#0a3641] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingContact ? 'Update Contact' : 'Save Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
