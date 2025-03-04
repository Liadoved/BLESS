import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Project, Contact, ProjectStats } from '../../../types';
import { getAuth } from 'firebase/auth';

export default function ProjectDashboard() {
  const router = useRouter();
  const { id } = router.query;
  const [project, setProject] = useState<Project | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relation: '' });

  useEffect(() => {
    if (id) {
      fetchProjectData();
    }
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        console.error('No user logged in');
        router.push('/login');
        return;
      }

      const idToken = await user.getIdToken();

      const headers = {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      };

      const [projectRes, contactsRes, statsRes] = await Promise.all([
        fetch(`/api/projects/${id}`, { headers }),
        fetch(`/api/projects/${id}/contacts`, { headers }),
        fetch(`/api/projects/${id}/stats`, { headers })
      ]);

      if (!projectRes.ok || !contactsRes.ok || !statsRes.ok) {
        throw new Error('Failed to fetch project data');
      }

      const [projectData, contactsData, statsData] = await Promise.all([
        projectRes.json(),
        contactsRes.json(),
        statsRes.json()
      ]);

      setProject(projectData);
      setContacts(contactsData || []); 
      setStats(statsData);
    } catch (error: any) {
      console.error('Failed to fetch project data:', error);
      if (error?.message === 'No user logged in') {
        router.push('/login');
      }
      alert(error?.message || 'Failed to fetch project data');
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        console.error('No user logged in');
        router.push('/login');
        return;
      }

      const idToken = await user.getIdToken();

      const response = await fetch(`/api/projects/${id}/contacts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newContact)
      });

      if (!response.ok) {
        throw new Error('Failed to add contact');
      }

      const newContactData = await response.json();
      setContacts(prev => [...prev, newContactData]);
      setIsAddingContact(false);
      setNewContact({ name: '', phone: '', relation: '' });
    } catch (error: any) {
      console.error('Failed to add contact:', error);
      alert(error?.message || 'Failed to add contact');
    }
  };

  const sendReminders = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        console.error('No user logged in');
        router.push('/login');
        return;
      }

      const idToken = await user.getIdToken();

      const pendingContacts = contacts.filter(c => c.status === 'pending');
      await fetch(`/api/projects/${id}/send-reminders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contacts: pendingContacts.map(c => c.id)
        })
      });
      fetchProjectData();
    } catch (error: any) {
      console.error('Failed to send reminders:', error);
      alert(error?.message || 'Failed to send reminders');
    }
  };

  if (!project || !stats) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Project Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {project.celebrantName} - Project Management
          </h1>
          <p className="text-gray-600">
            {stats.daysUntilDeadline} days until deadline
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Images</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.totalImages}/70</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Videos</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.totalVideos}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Pending Contacts</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.pendingContacts}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Completed Contacts</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.completedContacts}</div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <button
            onClick={() => router.push(`/projects/${id}/images`)}
            className="flex items-center justify-center p-6 bg-white rounded-lg shadow hover:bg-gray-50"
          >
            <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Upload Images
          </button>
          <button
            onClick={() => router.push(`/projects/${id}/videos`)}
            className="flex items-center justify-center p-6 bg-white rounded-lg shadow hover:bg-gray-50"
          >
            <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Manage Videos
          </button>
        </div>

        {/* Contacts List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Contacts</h2>
              <div className="flex space-x-4">
                <button
                  onClick={sendReminders}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Send Reminders
                </button>
                <button
                  onClick={() => setIsAddingContact(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Contact
                </button>
              </div>
            </div>
          </div>

          {isAddingContact && (
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <form onSubmit={handleAddContact} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={newContact.name}
                      onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      required
                      value={newContact.phone}
                      onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="relation" className="block text-sm font-medium text-gray-700">
                      Relation
                    </label>
                    <input
                      type="text"
                      id="relation"
                      value={newContact.relation}
                      onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsAddingContact(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Relation
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Reminder
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts.map((contact) => (
                  <tr key={contact.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {contact.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.relation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${contact.status === 'uploaded' ? 'bg-green-100 text-green-800' :
                          contact.status === 'sent' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'}`}
                      >
                        {contact.status === 'uploaded' ? 'Completed' :
                         contact.status === 'sent' ? 'Sent' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.lastReminder ? new Date(contact.lastReminder).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => {/* Send Reminder */}}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Send Reminder
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
