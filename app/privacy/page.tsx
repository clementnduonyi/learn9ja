// app/privacy/page.tsx
import Header from "@/components/home/Header";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow container px-4 md:px-6 py-8 md:py-12">
        <h1 className="text-4xl font-bold text-center mb-8">Privacy Policy</h1>

        <div className="max-w-4xl mx-auto space-y-6 text-gray-700 dark:text-gray-300">

           <div className="p-4 bg-yellow-100 text-yellow-800 rounded-md dark:bg-yellow-900 dark:text-yellow-200">
             <p className="font-bold">Legal Disclaimer:</p>
             <p>This is NOT legal advice. We have consulted with a legal professional to draft a comprehensive Privacy Policy that complies with all relevant data protection laws (like GDPR, CCPA, etc.) and accurately reflects our app&apos;s data collection, use, and sharing practices.</p>
          </div>


          <p>Last Updated: April 18, 2025</p> {/* Update date */}

          <p>
            <b>Learn9ja</b> (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting the privacy of our users (&quot;user&quot;, &quot;you&quot;). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website [Your Website URL] and use our live video class platform.
          </p>

          {/* Section: Information We Collect */}
          <h2 className="text-2xl font-semibold mt-6 mb-3">1. Information We Collect</h2>
          <p>
            We collect information that you provide directly to us when you create an account, use the Platform, or communicate with us. This may include:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li><b>Personal Identification Information:</b> Name, email address, date of birth.</li>
            <li><b>Profile Information:</b> User role (Student/Teacher), profile picture, biography, subject expertise (for teachers).</li>
            <li><b>Payment Information:</b> [Describe what is collected - e.g., payment card details are processed by a third-party processor and not stored by us, or if you handle it directly, describe how]</li>
            <li><b>Communication Data:</b> Messages and content shared during live sessions or via chat. [**Crucial:** If you record sessions, you MUST disclose this here and explain how recordings are stored, accessed, and for how long].</li>
            <li><b>Usage Data:</b> Information about how you use the Platform, including classes attended/taught, session duration, features used.</li>
            <li><b>Technical Data:</b> IP address, browser type, device information, operating system, log data.</li>
          </ul>
           <p><b>Requires legal input.</b> Specify exactly what data Supabase collects and stores on your behalf, and what other services you use (like payment processors, video providers, analytics) collect.]</p>


          {/* Section: How We Use Your Information */}
          <h2 className="text-2xl font-semibold mt-6 mb-3">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
           <ul className="list-disc list-inside space-y-2">
            <li>Provide, operate, and maintain the Platform.</li>
            <li>Create and manage your account.</li>
            <li>Facilitate live video classes and interaction between Students and Teachers.</li>
            <li>Process transactions and send related confirmations.</li>
            <li>Communicate with you about your account or services.</li>
            <li>Personalize your experience on the Platform.</li>
            <li>Monitor and analyze usage and trends to improve the Platform.</li>
            <li>Detect, prevent, and address technical issues or fraudulent activity.</li>
            <li>Enforce our Terms and policies.</li>
          </ul>

          {/* Section: How We Share Your Information */}
          <h2 className="text-2xl font-semibold mt-6 mb-3">3. How We Share Your Information</h2>
          <p>
            We may share your information with third parties in the following circumstances:
          </p>
           <ul className="list-disc list-inside space-y-2">
            <li><b>With Teachers/Students:</b> Limited profile information is shared between Students and Teachers to facilitate connections and classes. Content shared during sessions is visible to participants.</li>
            <li><b>Service Providers:</b> With third-party vendors who perform services on our behalf (e.g., payment processing via [Your Payment Processor], hosting via [Your Hosting Provider, e.g., Vercel/Netlify], database via Supabase, analytics, video infrastructure). These providers are given access only to the information necessary to perform their services and are required to protect the information.</li>
            <li><b>Legal Requirements:</b> If required to do so by law or in response to valid requests by public authorities.</li>
             <li><b>Business Transfers:</b> In connection with a merger, sale of assets, or other business transition.</li>
             <li><b>With Your Consent:</b> We may disclose your personal information for any other purpose with your consent.</li>
          </ul>
           <p>[**Requires legal input.** Be precise about *which* third parties you share data with (Supabase, Payment Processor, Video API, Analytics, etc.) and *why*.]</p>


           {/* Section: Data Security */}
           <h2 className="text-2xl font-semibold mt-6 mb-3">4. Data Security</h2>
           <p>
             We implement reasonable technical and organizational measures designed to protect your personal information from unauthorized access, use, or disclosure. [**Requires legal input.** Mention measures like encryption, access controls, etc. Be careful not to over-promise security].
           </p>

           {/* Section: Your Data Protection Rights (Crucial for GDPR, CCPA) */}
           <h2 className="text-2xl font-semibold mt-6 mb-3">5. Your Data Protection Rights</h2>
            <p>
              [**Requires significant legal input** especially based on jurisdiction - e.g., GDPR gives users rights like access, rectification, erasure, restriction, objection, data portability. CCPA gives rights regarding personal information].
              <br/>
              Example Placeholder: Depending on your location, you may have rights regarding your personal information, including the right to access, correct, or delete your data. To exercise these rights, please contact us using the details below.
            </p>

            {/* Section: Third-Party Links */}
            <h2 className="text-2xl font-semibold mt-6 mb-3">6. Third-Party Links</h2>
            <p>
              The Platform may contain links to third-party websites not operated by us. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
            </p>

             {/* Section: Children's Privacy */}
             <h2 className="text-2xl font-semibold mt-6 mb-3">7. Children&apos;s Privacy</h2>
             <p>
               [**Requires legal input.** Specify if your service is for users of all ages or restricted. If children might use it, comply with COPPA and similar laws.]
               <br/>
               Example Placeholder (If not targeting children): Our Platform is not intended for use by individuals under the age of 13. We do not knowingly collect personal information from children under 13.
             </p>


          {/* Section: Changes to This Privacy Policy */}
           <h2 className="text-2xl font-semibold mt-6 mb-3">8. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date.
          </p>

           {/* Section: Contact Us */}
           <h2 className="text-2xl font-semibold mt-6 mb-3">9. Contact Us</h2>
           <p>
             If you have any questions about this Privacy Policy, please contact us at <Link href="/contact" className="underline">Link to Contact Page</Link> or [Your Support Email Address].
           </p>

           {/* Add more sections as needed based on legal advice */}

        </div>
      </main>
    </div>
  );
}