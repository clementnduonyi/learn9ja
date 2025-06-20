// app/contact/page.tsx
// 'use client'; // Needed if using hooks or interactive form logic

import Header from "@/ui/home/Header";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// You'll need to implement the form submission logic
// This could involve a React hook for state, a server action, or an API route

export default function ContactPage() {
  // Example state for a client-side form (requires 'use client')
  // const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  // const [isSubmitting, setIsSubmitting] = useState(false);
  // const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  //   setFormData({ ...formData, [e.target.id]: e.target.value });
  // };

  // const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   setIsSubmitting(true);
  //   setSubmitStatus(null);

  //   // TODO: Implement actual form submission (e.g., send email via API route/server action)
  //   console.log('Form submitted:', formData);

  //   // Simulate API call
  //   await new Promise(resolve => setTimeout(resolve, 1000));

  //   // TODO: Handle success or error response
  //   setSubmitStatus('Message sent successfully!'); // Or 'Failed to send message.'
  //   setIsSubmitting(false);
  //   // setFormData({ name: '', email: '', subject: '', message: '' }); // Clear form on success
  // };


  return (
    <div className="flex min-h-screen flex-col">
      {/*<Header />*/}
      <main className="flex-grow container px-4 md:px-6 py-8 md:py-12">
        <h1 className="text-4xl font-bold text-center mb-8">Contact Us</h1>

        <div className="max-w-2xl mx-auto space-y-6">
          <p className="text-center text-lg text-gray-700 dark:text-gray-300">
            Have questions, feedback, or need support? Get in touch with us using the form below or via email.
          </p>

          {/* Contact Form */}
          {/* Wrap in <form onSubmit={handleSubmit}> and add form logic if client-side */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your Name" /* value={formData.name} onChange={handleChange} required */ />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your@email.com" /* value={formData.email} onChange={handleChange} required */ />
            </div>
             <div className="space-y-2">
              <Label htmlFor="subject">Subject (Optional)</Label>
              <Input id="subject" placeholder="Subject of your message" /* value={formData.subject} onChange={handleChange} */ />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" placeholder="Your message here..." className="min-h-[150px]" /* value={formData.message} onChange={handleChange} required */ />
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" /* disabled={isSubmitting} */>
              {/* {isSubmitting ? 'Sending...' : 'Send Message'} */}
              Send Message {/* Static text if no state/logic */}
            </Button>

            {/* Submission Status Message (Optional) */}
            {/* {submitStatus && (
              <div className={`mt-4 text-center ${submitStatus.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                {submitStatus}
              </div>
            )} */}

          </div>

          {/* Alternative Contact Info (Optional) */}
          <div className="text-center mt-8 space-y-2 text-gray-700 dark:text-gray-300">
              <p>Or contact us directly:</p>
              <p className="font-semibold">Email: <a href="mailto:[Your Support Email]" className="underline">[Your Support Email]</a></p>
              {/* <p className="font-semibold">Phone: [Your Phone Number (Optional)]</p> */}
               {/* <p className="font-semibold">Address: [Your Physical Address (Optional)]</p> */}
          </div>

        </div>
      </main>
    </div>
  );
}