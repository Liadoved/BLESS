import { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import { getProjectsByManager, getProject, getProjectContacts, updateContact, getContactVideos, addVideo, getVideoQuestions } from '../lib/firebase-utils';
import { Project, Contact, ContactVideo, VideoQuestion } from '../types/firebase';

export default function TestFirebase() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{[key: string]: boolean}>({});
  const [project, setProject] = useState<Project | null>(null);

  const runTests = async () => {
    setLoading(true);
    setError(null);
    const results: {[key: string]: boolean} = {};

    try {
      // Test 1: Create a new project
      console.log('Creating test project...');
      const testProject: Omit<Project, 'id'> = {
        celebrantName: 'Test Celebrant',
        celebrantGender: 'other',
        eventType: 'birthday',
        deadline: Timestamp.fromDate(new Date('2024-12-31')),
        managerName: 'Test Manager',
        managerId: 'test-manager-id',
        driveRootFolderId: 'test-root-folder',
        imagesFolderId: 'test-images-folder',
        videosFolderId: 'test-videos-folder',
        createdAt: Timestamp.now(),
        status: 'active'
      };

      // Test 2: Get projects by manager
      console.log('Getting projects by manager...');
      const projects = await getProjectsByManager('test-manager-id');
      results['Get Projects'] = projects !== null;
      console.log('Projects:', projects);

      if (projects.length > 0) {
        const projectId = projects[0].id;
        
        // Test 3: Get single project
        console.log('Getting single project...');
        const singleProject = await getProject(projectId);
        results['Get Single Project'] = singleProject !== null;
        setProject(singleProject);
        console.log('Single Project:', singleProject);

        // Test 4: Get project contacts
        console.log('Getting project contacts...');
        const contacts = await getProjectContacts(projectId);
        results['Get Contacts'] = Array.isArray(contacts);
        console.log('Contacts:', contacts);

        if (contacts.length > 0) {
          const contactId = contacts[0].id;

          // Test 5: Update contact
          console.log('Updating contact...');
          await updateContact(contactId, { status: 'sent' });
          results['Update Contact'] = true;

          // Test 6: Get contact videos
          console.log('Getting contact videos...');
          const videos = await getContactVideos(contactId);
          results['Get Videos'] = Array.isArray(videos);
          console.log('Videos:', videos);

          // Test 7: Add video
          console.log('Adding test video...');
          const newVideo: Omit<ContactVideo, 'id'> = {
            questionId: 'test-question-id',
            driveFileId: 'test-drive-file-id',
            uploadedAt: Timestamp.now(),
            duration: 60,
            thumbnailUrl: 'https://example.com/thumbnail.jpg'
          };
          const videoId = await addVideo(contactId, newVideo);
          results['Add Video'] = videoId !== null;
          console.log('New Video ID:', videoId);
        }

        // Test 8: Get video questions
        console.log('Getting video questions...');
        const questions = await getVideoQuestions(projectId);
        results['Get Questions'] = Array.isArray(questions);
        console.log('Questions:', questions);
      }

    } catch (err) {
      console.error('Test Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setTestResults(results);
      setLoading(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  if (loading) return <div className="p-4">Running Firebase tests...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Firebase Test Results</h1>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Test Results:</h2>
        {Object.entries(testResults).map(([test, passed]) => (
          <div key={test} className="flex items-center mb-2">
            <span className={`mr-2 ${passed ? 'text-green-500' : 'text-red-500'}`}>
              {passed ? '✓' : '✗'}
            </span>
            <span>{test}</span>
          </div>
        ))}
      </div>

      {project && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Sample Project Data:</h2>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(project, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
