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

      // Fetch project data first
      try {
        const projectRes = await fetch(`/api/projects/${id}`, { headers });
        if (!projectRes.ok) {
          console.error('Failed to fetch project data:', await projectRes.text());
          throw new Error('Failed to fetch project data');
        }
        const projectData = await projectRes.json();
        setProject(projectData);

        // Only fetch contacts and stats if project data was successful
        try {
          const [contactsRes, statsRes] = await Promise.all([
            fetch(`/api/projects/${id}/contacts`, { headers }),
            fetch(`/api/projects/${id}/stats`, { headers })
          ]);

          if (!contactsRes.ok) {
            console.error('Failed to fetch contacts:', await contactsRes.text());
            // Don't throw, just log the error
          } else {
            const contactsData = await contactsRes.json();
            setContacts(contactsData);
          }

          if (!statsRes.ok) {
            console.error('Failed to fetch stats:', await statsRes.text());
            // Don't throw, just log the error
          } else {
            const statsData = await statsRes.json();
            setStats(statsData);
          }
        } catch (innerError: any) {
          console.error('Error fetching additional data:', innerError);
          // Don't throw, we already have the project data
        }
      } catch (projectError: any) {
        console.error('Error fetching project:', projectError);
        throw projectError;
      }
    } catch (error: any) {
      console.error('Failed to fetch project data:', error);
      alert('שגיאה בטעינת נתוני הפרויקט: ' + (error?.message || 'אנא נסה שוב מאוחר יותר'));
      router.push('/');
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

  return (
    <div className="container mx-auto px-4 py-8">
      {project ? (
        <div>
          <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">{project.celebrantName}</h1>
              <div className="text-sm text-gray-500">
                תאריך יעד: {new Date(project.deadline).toLocaleDateString('he-IL')}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 shadow">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">סוג אירוע</h3>
                <p className="text-gray-700">{project.eventType}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 shadow">
                <h3 className="text-lg font-semibold text-green-800 mb-2">מנהל הפרויקט</h3>
                <p className="text-gray-700">{project.managerName}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 shadow">
                <h3 className="text-lg font-semibold text-purple-800 mb-2">מגדר</h3>
                <p className="text-gray-700">{project.gender === 'male' ? 'זכר' : 'נקבה'}</p>
              </div>
            </div>
            
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 shadow">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">סטטיסטיקה</h3>
                  <div className="flex justify-between">
                    <div>
                      <p className="text-gray-600">סה"כ אנשי קשר</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.totalContacts}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">סה"כ תגובות</p>
                      <p className="text-2xl font-bold text-green-600">{stats.totalResponses}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">אחוז תגובות</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {stats.totalContacts > 0 
                          ? Math.round((stats.totalResponses / stats.totalContacts) * 100) 
                          : 0}%
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 shadow">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">פעולות מהירות</h3>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setIsAddingContact(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                    >
                      הוסף איש קשר
                    </button>
                    <button 
                      className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
                    >
                      שלח הודעות
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">אנשי קשר</h2>
              <button 
                onClick={() => setIsAddingContact(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                הוסף איש קשר
              </button>
            </div>

            {contacts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        שם
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        טלפון
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        קשר
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        פעולות
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
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 ml-4">ערוך</button>
                          <button className="text-red-600 hover:text-red-900">מחק</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">אין אנשי קשר</h3>
                <p className="mt-1 text-sm text-gray-500">התחל להוסיף אנשי קשר לפרויקט.</p>
                <div className="mt-6">
                  <button
                    onClick={() => setIsAddingContact(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    הוסף איש קשר
                  </button>
                </div>
              </div>
            )}
          </div>

          {isAddingContact && (
            <div className="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
              <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-lg text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:mt-0 sm:mr-4 sm:text-right w-full">
                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                          הוסף איש קשר חדש
                        </h3>
                        <div className="mt-4">
                          <form onSubmit={handleAddContact}>
                            <div className="mb-4">
                              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                שם
                              </label>
                              <input
                                type="text"
                                id="name"
                                value={newContact.name}
                                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                              />
                            </div>
                            <div className="mb-4">
                              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                טלפון
                              </label>
                              <input
                                type="tel"
                                id="phone"
                                value={newContact.phone}
                                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                              />
                            </div>
                            <div className="mb-4">
                              <label htmlFor="relation" className="block text-sm font-medium text-gray-700">
                                קשר
                              </label>
                              <input
                                type="text"
                                id="relation"
                                value={newContact.relation}
                                onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                              />
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      onClick={handleAddContact}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      הוסף
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingContact(false);
                        setNewContact({ name: '', phone: '', relation: '' });
                      }}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      ביטול
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
}
