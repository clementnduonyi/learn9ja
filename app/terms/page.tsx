// app/terms/page.tsx
import Header from "@/components/home/Header";
import Link from "next/link";

export default function TermsAndConditionsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow container px-4 md:px-6 py-8 md:py-12">
        <h1 className="text-4xl font-bold text-center mb-8">Terms & Conditions</h1>

        <div className="max-w-4xl mx-auto space-y-6 text-gray-700 dark:text-gray-300">

          <div className="p-4 bg-yellow-100 text-yellow-800 rounded-md dark:bg-yellow-900 dark:text-yellow-200">
             <p className="font-bold">Legal Disclaimer:</p>
             <p>This is NOT legal advice. We have consulted with a legal professional to draft comprehensive Terms & Conditions that are applicable to our platform, services, and jurisdiction.</p>
          </div>


          <p>Last Updated: April 18, 2025</p> {/* Update date */}

        <p>
          Welcome to <b>Learn9ja</b> (&quot;Platform&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). These Terms and Conditions (&quot;Terms&quot;) govern your access to and use of the Learn9ja website and services, including our live video class platform. By accessing or using the Platform, you agree to be bound by these Terms and our Privacy Policy.
        </p>

          {/* Section: Acceptance of Terms */}
          <h2 className="text-2xl font-semibold mt-6 mb-3">1. Acceptance of Terms</h2>
          <p>
            By creating an account or using the Platform, you represent and warrant that you have read, understood, and agree to be bound by these Terms, whether you are a Student, Teacher, or any other user of the Platform. If you do not agree to these Terms, you may not use the Platform.
          </p>

          {/* Section: Changes to Terms */}
          <h2 className="text-2xl font-semibold mt-6 mb-3">2. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. By continuing to access or use our Platform after any revisions become effective, you agree to be bound by the revised terms.
          </p>

          {/* Section: User Accounts */}
          <h2 className="text-2xl font-semibold mt-6 mb-3">3. User Accounts</h2>
          <p>
            You may need to register for an account to access certain features of the Platform. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and for all activities that occur under your account.
          </p>

          {/* Section: Platform Services */}
          <h2 className="text-2xl font-semibold mt-6 mb-3">4. Platform Services</h2>
          <p>
            The Platform provides a marketplace and tools for Students to find and book live video classes and for Teachers to offer and conduct live video classes. We do not employ Teachers and are not responsible for the conduct of Teachers or Students. We are not responsible for the content of classes.
          </p>

          {/* Section: Fees and Payments (Crucial to customize if you handle payments) */}
          <h2 className="text-2xl font-semibold mt-6 mb-3">5. Fees and Payments</h2>
          <p>
            [**This section requires significant customization.** Detail how fees are charged, payment processing, teacher payouts, platform commissions, refund policies, taxes, etc. If you use a third-party payment processor, their terms will also apply.]
            <br/>
            Example Placeholder: Users agree to pay all fees associated with classes booked through the Platform. All transactions are processed securely via Paysatck. Details regarding pricing and payment terms are available on our [Pricing Page Link] or during the booking process.
          </p>

          {/* Section: User Responsibilities */}
           <h2 className="text-2xl font-semibold mt-6 mb-3">6. User Responsibilities</h2>
          <p>
            You are responsible for your use of the Platform and for any content you provide. You agree not to use the Platform for any unlawful or prohibited activities.
          </p>

           {/* Section: Intellectual Property */}
           <h2 className="text-2xl font-semibold mt-6 mb-3">7. Intellectual Property</h2>
          <p>
            All content on the Platform, excluding User Content, is owned by Learn9ja or its licensors. You may not use Platform content without permission. Users retain ownership of their own content (e.g., class materials they upload), but grant the Platform a license to use it to provide the service. [**Requires legal input** on how user content rights are handled].
          </p>

           {/* Section: Prohibited Conduct */}
           <h2 className="text-2xl font-semibold mt-6 mb-3">8. Prohibited Conduct</h2>
          <p>
            List of specific actions that are not allowed on the platform (harassment, sharing illegal content, hacking, spamming, etc.).
          </p>

           {/* Section: Termination */}
           <h2 className="text-2xl font-semibold mt-6 mb-3">9. Termination</h2>
          <p>
            We may terminate or suspend your account and access to the Platform immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>


          {/* Section: Disclaimer of Warranties (Crucial Legal Section) */}
           <h2 className="text-2xl font-semibold mt-6 mb-3">10. Disclaimer of Warranties</h2>
           <p>
             [**Requires legal input.** This section limits your liability and states that the service is provided &quot;as is&quot;.]
             <br/>
             Example Placeholder: The Platform is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. We make no warranties, express or implied, regarding the operation or availability of the Platform or the information, content, materials, or products included thereon.
           </p>

          {/* Section: Limitation of Liability (Crucial Legal Section) */}
           <h2 className="text-2xl font-semibold mt-6 mb-3">11. Limitation of Liability</h2>
           <p>
             [**Requires legal input.** This section limits the amount of damages a user can claim from you.]
              <br/>
              Example Placeholder: In no event shall [Your Company Name], nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Platform; (ii) any conduct or content of any third party on the Platform; (iii) any content obtained from the Platform; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory.
           </p>

          {/* Section: Governing Law */}
           <h2 className="text-2xl font-semibold mt-6 mb-3">12. Governing Law</h2>
           <p>
             [**Requires legal input.** Specify which jurisdiction&apos;s laws will govern these terms.]
             <br/>
             Example Placeholder: These Terms shall be governed and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
           </p>

           {/* Section: Contact Us */}
           <h2 className="text-2xl font-semibold mt-6 mb-3">13. Contact Us</h2>
           <p>
             If you have any questions about these Terms, please contact us at <Link href="/contact" className="underline">Link to Contact Page</Link> or [Your Support Email Address].
           </p>

           {/* Add more sections as needed based on legal advice */}

        </div>
      </main>
    </div>
  );
}