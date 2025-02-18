export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-3">1. Information We Collect</h2>
          <p>We collect information that you provide directly to us when using BLESS:</p>
          <ul className="list-disc ml-6 mt-2">
            <li>Google account information for authentication</li>
            <li>Video content uploaded through the platform</li>
            <li>Project and contact information</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">2. How We Use Your Information</h2>
          <p>We use the collected information to:</p>
          <ul className="list-disc ml-6 mt-2">
            <li>Provide and maintain the BLESS service</li>
            <li>Store and process video content</li>
            <li>Manage projects and contacts</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">3. Data Storage</h2>
          <p>All data is stored securely using:</p>
          <ul className="list-disc ml-6 mt-2">
            <li>Google Cloud Platform</li>
            <li>Firebase</li>
            <li>Google Drive (for video storage)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">4. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at:</p>
          <p className="mt-2">Email: oved.liad@gmail.com</p>
        </section>
      </div>
    </div>
  );
}
