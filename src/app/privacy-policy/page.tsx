import { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how ProTenders collects, uses, and protects your personal information when you use our government tender platform.",
};

export default function PrivacyPolicy() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Privacy Policy' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="w-full border-b bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="content-container py-16">
          <Breadcrumbs items={breadcrumbItems} />

          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Privacy Policy
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl">
                Last updated: {new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full py-12">
        <div className="content-container">
          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Introduction</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                ProTenders ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website <Link href="/" className="text-primary hover:underline">protenders.co.za</Link> and use our services.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>

              <h3 className="text-xl font-semibold mb-3 mt-6">Personal Information</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may collect personal information that you voluntarily provide to us when you:
              </p>
              <ul className="space-y-2 text-muted-foreground mb-4">
                <li>• Register for an account</li>
                <li>• Subscribe to tender alerts</li>
                <li>• Fill out a contact form</li>
                <li>• Subscribe to our newsletter</li>
                <li>• Provide feedback or suggestions</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mb-4">
                This information may include:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Name and business name</li>
                <li>• Email address</li>
                <li>• Phone number</li>
                <li>• Company information</li>
                <li>• Industry sector and business interests</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">Automatically Collected Information</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                When you visit our website, we may automatically collect certain information about your device and usage patterns, including:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• IP address and browser type</li>
                <li>• Operating system and device information</li>
                <li>• Pages viewed and time spent on pages</li>
                <li>• Referring website addresses</li>
                <li>• Search terms and browsing behavior</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Provide, operate, and maintain our tender notification services</li>
                <li>• Send you relevant tender alerts matching your preferences</li>
                <li>• Improve and personalize your user experience</li>
                <li>• Respond to your inquiries and provide customer support</li>
                <li>• Send administrative information and service updates</li>
                <li>• Analyze usage patterns to improve our platform</li>
                <li>• Detect and prevent fraud and security issues</li>
                <li>• Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Cookies and Tracking Technologies</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use cookies and similar tracking technologies to track activity on our website and store certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use cookies for:
              </p>
              <ul className="space-y-2 text-muted-foreground mb-4">
                <li>• Authentication and security</li>
                <li>• Remembering your preferences</li>
                <li>• Analytics and performance monitoring (Google Analytics, Microsoft Clarity, Mixpanel)</li>
                <li>• Improving user experience</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Sharing Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• <strong>Service Providers:</strong> With third-party service providers who perform services on our behalf (email delivery, analytics, hosting)</li>
                <li>• <strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                <li>• <strong>Business Transfers:</strong> In connection with a merger, sale, or acquisition of all or part of our business</li>
                <li>• <strong>With Your Consent:</strong> When you have given us explicit permission to share your information</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Data Security</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="space-y-2 text-muted-foreground mb-4">
                <li>• Encryption of data in transit using SSL/TLS</li>
                <li>• Secure database storage with encryption at rest</li>
                <li>• Regular security audits and updates</li>
                <li>• Access controls and authentication mechanisms</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Your Privacy Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Under the Protection of Personal Information Act (POPIA) and other applicable privacy laws, you have certain rights regarding your personal information:
              </p>
              <ul className="space-y-2 text-muted-foreground mb-4">
                <li>• <strong>Access:</strong> Request access to your personal information we hold</li>
                <li>• <strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
                <li>• <strong>Deletion:</strong> Request deletion of your personal information</li>
                <li>• <strong>Objection:</strong> Object to processing of your personal information</li>
                <li>• <strong>Data Portability:</strong> Request transfer of your data to another service</li>
                <li>• <strong>Withdraw Consent:</strong> Withdraw consent for processing at any time</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                To exercise these rights, please contact us at <a href="mailto:tendersportlight@gmail.com" className="text-primary hover:underline">tendersportlight@gmail.com</a>
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Third-Party Links</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our website may contain links to third-party websites, including government tender portals and official procurement sites. We are not responsible for the privacy practices of these external sites. We encourage you to read the privacy policies of any third-party sites you visit.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you become aware that a child has provided us with personal information, please contact us, and we will take steps to delete such information.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your information, we will securely delete or anonymize it.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">International Data Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your information may be transferred to and maintained on servers located outside of South Africa. By using our services, you consent to the transfer of your information to countries that may have different data protection laws than South Africa. We ensure appropriate safeguards are in place for such transfers.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this policy.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-primary/5 rounded-lg p-6 mb-4">
                <p className="text-muted-foreground mb-2"><strong>Email:</strong> <a href="mailto:tendersportlight@gmail.com" className="text-primary hover:underline">tendersportlight@gmail.com</a></p>
                <p className="text-muted-foreground mb-2"><strong>Website:</strong> <Link href="/" className="text-primary hover:underline">https://protenders.co.za</Link></p>
                <p className="text-muted-foreground"><strong>Contact Form:</strong> <Link href="/contact" className="text-primary hover:underline">https://protenders.co.za/contact</Link></p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">POPIA Compliance</h2>
              <p className="text-muted-foreground leading-relaxed">
                ProTenders is committed to complying with the Protection of Personal Information Act (POPIA) of South Africa. We process personal information lawfully, fairly, and transparently, and only for legitimate business purposes. We implement appropriate safeguards to protect your information and respect your rights as a data subject.
              </p>
            </section>

            <div className="bg-gradient-to-br from-primary/5 to-background rounded-lg p-8 mt-12">
              <h3 className="text-xl font-semibold mb-4">Questions or Concerns?</h3>
              <p className="text-muted-foreground mb-6">
                If you have any questions about how we handle your personal information or wish to exercise your privacy rights, please don't hesitate to contact us.
              </p>
              <Link href="/contact" className="inline-flex items-center text-primary hover:underline font-medium">
                Contact Us →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
