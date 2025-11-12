import { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read the terms and conditions governing your use of ProTenders' government tender platform and services.",
};

export default function TermsOfService() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Terms of Service' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="w-full border-b bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="content-container py-16">
          <Breadcrumbs items={breadcrumbItems} />

          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Terms of Service
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
              <h2 className="text-2xl font-bold mb-4">Agreement to Terms</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                These Terms of Service ("Terms") constitute a legally binding agreement between you and ProTenders ("Company", "we", "us", or "our") concerning your access to and use of the <Link href="/" className="text-primary hover:underline">protenders.co.za</Link> website and our services.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using our platform, you agree that you have read, understood, and agree to be bound by these Terms. If you do not agree with these Terms, you must not access or use our services.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Description of Services</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                ProTenders is a government tender aggregation and notification platform that provides:
              </p>
              <ul className="space-y-2 text-muted-foreground mb-4">
                <li>• Access to government tender opportunities from various South African government sources</li>
                <li>• Tender search and filtering capabilities</li>
                <li>• Email alerts for new tender opportunities matching user preferences</li>
                <li>• Tender categorization by province, category, and other criteria</li>
                <li>• Educational resources about the tendering process</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Our services are provided "as is" and we reserve the right to modify, suspend, or discontinue any part of our services at any time without notice.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">User Accounts and Registration</h2>

              <h3 className="text-xl font-semibold mb-3 mt-6">Account Creation</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To access certain features of our platform, you may be required to create an account. When creating an account, you agree to:
              </p>
              <ul className="space-y-2 text-muted-foreground mb-4">
                <li>• Provide accurate, current, and complete information</li>
                <li>• Maintain and promptly update your account information</li>
                <li>• Maintain the security of your password and account</li>
                <li>• Accept responsibility for all activities that occur under your account</li>
                <li>• Notify us immediately of any unauthorized use of your account</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">Account Termination</h3>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to suspend or terminate your account at any time for violation of these Terms, fraudulent activity, or any other reason we deem appropriate. You may also terminate your account at any time by contacting us at <a href="mailto:tendersportlight@gmail.com" className="text-primary hover:underline">tendersportlight@gmail.com</a>.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Acceptable Use Policy</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You agree not to use our platform to:
              </p>
              <ul className="space-y-2 text-muted-foreground mb-4">
                <li>• Violate any applicable laws, regulations, or third-party rights</li>
                <li>• Engage in any fraudulent, abusive, or harmful activities</li>
                <li>• Scrape, crawl, or use automated systems to extract data without permission</li>
                <li>• Attempt to gain unauthorized access to our systems or other users' accounts</li>
                <li>• Distribute viruses, malware, or other harmful code</li>
                <li>• Impersonate any person or entity or misrepresent your affiliation</li>
                <li>• Interfere with or disrupt the integrity or performance of our services</li>
                <li>• Use our services for any illegal or unauthorized purpose</li>
                <li>• Resell or redistribute our services without explicit permission</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Intellectual Property Rights</h2>

              <h3 className="text-xl font-semibold mb-3 mt-6">Our Content</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                All content on ProTenders, including but not limited to text, graphics, logos, images, software, and data compilations, is the property of ProTenders or its content suppliers and is protected by South African and international copyright laws.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The ProTenders name, logo, and all related names, logos, product and service names, designs, and slogans are trademarks of ProTenders. You may not use such marks without our prior written permission.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">Government Tender Data</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Tender information displayed on our platform is aggregated from publicly available government sources. We do not claim ownership of this government data. The original tender information remains the property of the respective government departments and agencies.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">Limited License</h3>
              <p className="text-muted-foreground leading-relaxed">
                We grant you a limited, non-exclusive, non-transferable license to access and use our services for your personal or business tender research purposes. This license does not include any right to reproduce, distribute, modify, or create derivative works from our content.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Data Accuracy and Liability</h2>

              <h3 className="text-xl font-semibold mb-3 mt-6">Information Accuracy</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                While we strive to provide accurate and up-to-date tender information, we do not guarantee the accuracy, completeness, or timeliness of any information displayed on our platform. Tender details, closing dates, and requirements are sourced from government portals and may change without notice.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">User Responsibility</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You are solely responsible for:
              </p>
              <ul className="space-y-2 text-muted-foreground mb-4">
                <li>• Verifying tender information with official government sources</li>
                <li>• Ensuring compliance with tender requirements and deadlines</li>
                <li>• Preparing and submitting tender responses directly to the issuing authority</li>
                <li>• Meeting all legal and regulatory requirements for tendering</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">No Tender Application Service</h3>
              <p className="text-muted-foreground leading-relaxed">
                ProTenders is an information aggregation platform only. We do not submit tender applications on your behalf, provide tender preparation services, or guarantee tender awards. All tender applications must be submitted directly to the relevant government department or agency.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Disclaimer of Warranties</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                OUR SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="space-y-2 text-muted-foreground mb-4">
                <li>• Warranties of merchantability, fitness for a particular purpose, or non-infringement</li>
                <li>• Warranties that our services will be uninterrupted, secure, or error-free</li>
                <li>• Warranties regarding the accuracy, reliability, or completeness of any information</li>
                <li>• Warranties that defects will be corrected</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                We do not warrant that our services will meet your requirements or that the operation of our services will be uninterrupted or error-free.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, PROTENDERS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
              </p>
              <ul className="space-y-2 text-muted-foreground mb-4">
                <li>• Your access to or use of (or inability to access or use) our services</li>
                <li>• Any conduct or content of any third party on our services</li>
                <li>• Unauthorized access to, use of, or alteration of your data</li>
                <li>• Errors or inaccuracies in tender information</li>
                <li>• Missed tender deadlines or opportunities</li>
                <li>• Failed or unsuccessful tender applications</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Our total liability to you for any claims arising from your use of our services shall not exceed the amount you paid to us, if any, in the twelve months prior to the claim.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Indemnification</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree to indemnify, defend, and hold harmless ProTenders, its officers, directors, employees, agents, and affiliates from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorneys' fees, arising out of or in any way connected with your access to or use of our services, your violation of these Terms, or your violation of any rights of another.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Third-Party Links and Services</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our platform may contain links to third-party websites, including official government tender portals. These links are provided for your convenience only. We do not endorse, control, or assume responsibility for the content, privacy policies, or practices of any third-party websites.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You acknowledge and agree that we shall not be liable for any damage or loss caused by your use of any third-party websites or services.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Email Communications and Alerts</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                By subscribing to our tender alert services, you consent to receive email notifications about tender opportunities. You may unsubscribe from these alerts at any time by:
              </p>
              <ul className="space-y-2 text-muted-foreground mb-4">
                <li>• Clicking the "unsubscribe" link in any email</li>
                <li>• Updating your preferences in your account settings</li>
                <li>• Contacting us at <a href="mailto:tendersportlight@gmail.com" className="text-primary hover:underline">tendersportlight@gmail.com</a></li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to send you service-related emails, such as account notifications and security alerts, which you cannot opt out of while maintaining an active account.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Privacy and Data Protection</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Your use of our services is also governed by our <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>, which explains how we collect, use, and protect your personal information in accordance with the Protection of Personal Information Act (POPIA).
              </p>
              <p className="text-muted-foreground leading-relaxed">
                By using our services, you consent to the collection and use of your information as described in our Privacy Policy.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Modifications to Terms</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We reserve the right to modify these Terms at any time. We will notify users of any material changes by:
              </p>
              <ul className="space-y-2 text-muted-foreground mb-4">
                <li>• Updating the "Last updated" date at the top of these Terms</li>
                <li>• Posting a notice on our website</li>
                <li>• Sending an email notification to registered users</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Your continued use of our services after any modifications indicates your acceptance of the updated Terms. If you do not agree to the modified Terms, you must stop using our services.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Termination</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may terminate or suspend your access to our services immediately, without prior notice or liability, for any reason, including but not limited to breach of these Terms.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Upon termination, your right to use our services will immediately cease. All provisions of these Terms which by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Governing Law and Jurisdiction</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                These Terms shall be governed by and construed in accordance with the laws of the Republic of South Africa, without regard to its conflict of law provisions.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Any disputes arising from these Terms or your use of our services shall be subject to the exclusive jurisdiction of the courts of South Africa.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Severability</h2>
              <p className="text-muted-foreground leading-relaxed">
                If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary so that these Terms shall otherwise remain in full force and effect and enforceable.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Entire Agreement</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and ProTenders regarding your use of our services and supersede any prior agreements or understandings.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-primary/5 rounded-lg p-6 mb-4">
                <p className="text-muted-foreground mb-2"><strong>Email:</strong> <a href="mailto:tendersportlight@gmail.com" className="text-primary hover:underline">tendersportlight@gmail.com</a></p>
                <p className="text-muted-foreground mb-2"><strong>Website:</strong> <Link href="/" className="text-primary hover:underline">https://protenders.co.za</Link></p>
                <p className="text-muted-foreground"><strong>Contact Form:</strong> <Link href="/contact" className="text-primary hover:underline">https://protenders.co.za/contact</Link></p>
              </div>
            </section>

            <div className="bg-gradient-to-br from-primary/5 to-background rounded-lg p-8 mt-12">
              <h3 className="text-xl font-semibold mb-4">Questions About These Terms?</h3>
              <p className="text-muted-foreground mb-6">
                If you have any questions or concerns about these Terms of Service, we're here to help. Please reach out to our team.
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
