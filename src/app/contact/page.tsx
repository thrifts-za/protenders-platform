"use client";

import { useState } from "react";
import { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MapPin, Phone, Send, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    honeypot: "", // Bot trap field
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Contact Us' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you as soon as possible.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        honeypot: "",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      toast({
        title: "Error sending message",
        description: errorMessage.includes('Too many')
          ? errorMessage
          : "Please try again or email us directly at tendersportlight@gmail.com",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="w-full border-b bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="content-container py-16">
          <Breadcrumbs items={breadcrumbItems} />

          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Contact Us
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl">
                Have a question or feedback? We'd love to hear from you. Get in touch with the ProTenders team.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full py-12">
        <div className="content-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Contact Information Cards */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Email</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Send us an email anytime
                </CardDescription>
                <a
                  href="mailto:tendersportlight@gmail.com"
                  className="text-primary hover:underline font-medium mt-2 block"
                >
                  tendersportlight@gmail.com
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Location</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Serving businesses across South Africa
                </CardDescription>
                <p className="text-muted-foreground mt-2">
                  All 9 provinces
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Support</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  We typically respond within 24 hours
                </CardDescription>
                <p className="text-muted-foreground mt-2">
                  Monday - Friday
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Send us a message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Honeypot field - hidden from users, visible to bots */}
                  <input
                    type="text"
                    name="honeypot"
                    value={formData.honeypot}
                    onChange={handleChange}
                    style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px' }}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="What is this regarding?"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us more about your inquiry..."
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full md:w-auto"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto mt-12">
            <div className="bg-gradient-to-br from-primary/5 to-background rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground mb-6">
                Before reaching out, you might find the answer to your question in our FAQ section.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">How do I subscribe to tender alerts?</h3>
                  <p className="text-muted-foreground text-sm">
                    You can set up custom tender alerts by visiting our{" "}
                    <a href="/alerts" className="text-primary hover:underline">Alerts page</a>.
                    Simply create an account and configure your preferences.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Is ProTenders free to use?</h3>
                  <p className="text-muted-foreground text-sm">
                    Yes! ProTenders provides free access to government tender information.
                    We aggregate publicly available tender data to help businesses find opportunities.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Do you submit tenders on my behalf?</h3>
                  <p className="text-muted-foreground text-sm">
                    No, ProTenders is an information platform only. You must submit tender applications
                    directly to the relevant government department or agency. We provide the information
                    you need to find and apply for tenders.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">How often is tender data updated?</h3>
                  <p className="text-muted-foreground text-sm">
                    Our platform updates tender information regularly throughout the day. However, we
                    recommend verifying critical details (especially closing dates) with the official
                    government source before submitting.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <a href="/faq" className="text-primary hover:underline font-medium">
                  View all FAQs →
                </a>
              </div>
            </div>
          </div>

          {/* Additional Resources */}
          <div className="max-w-3xl mx-auto mt-12">
            <h2 className="text-2xl font-bold mb-6">Other Ways to Get Help</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resources</CardTitle>
                  <CardDescription>
                    Learn more about government tendering
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>
                      <a href="/how-it-works" className="text-primary hover:underline text-sm">
                        How Government Tendering Works →
                      </a>
                    </li>
                    <li>
                      <a href="/glossary" className="text-primary hover:underline text-sm">
                        Tender Terminology Glossary →
                      </a>
                    </li>
                    <li>
                      <a href="/resources" className="text-primary hover:underline text-sm">
                        All Resources →
                      </a>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Community</CardTitle>
                  <CardDescription>
                    Help us build a better platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>
                      <a href="/feedback" className="text-primary hover:underline text-sm">
                        Submit Feedback →
                      </a>
                    </li>
                    <li>
                      <a href="/about" className="text-primary hover:underline text-sm">
                        About ProTenders →
                      </a>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
