"use client"

import type React from "react"
import { useState } from "react"
import { PublicLayout } from "@/components/public-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Calendar, MapPin, Users, Star, Phone, Mail, Clock, Heart, Award } from "lucide-react"
import { ReserveButton } from "@/components/reserve-button"
import { TourButton } from "@/components/tour-button"
import { useToast } from "@/hooks/use-toast"
import { TermsDialog } from "@/components/terms-dialog"
import { useMessages } from "@/components/message-context"

export default function HomePage() {
  const { toast } = useToast()
  const { addMessage } = useMessages()
  const [showTerms, setShowTerms] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "",
    eventDate: "",
    message: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreedToTerms) {
      toast({
        title: "Terms agreement required",
        description: "Please read and agree to the terms and conditions.",
        variant: "destructive",
      })
      return
    }

    addMessage({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      eventType: formData.eventType,
      eventDate: formData.eventDate,
      message: formData.message,
    })

    toast({
      title: "Message sent!",
      description: "Thank you for your inquiry. We'll get back to you within 24 hours.",
    })

    setFormData({
      name: "",
      email: "",
      phone: "",
      eventType: "",
      eventDate: "",
      message: "",
    })
    setAgreedToTerms(false)
  }

  const faqs = [
    {
      question: "How far in advance should I book my event?",
      answer: "We recommend booking at least 3-6 months in advance, especially for popular dates like weekends and holidays. However, we can sometimes accommodate last-minute bookings depending on availability.",
    },
    {
      question: "What is included in the venue rental?",
      answer: "Our venue rental includes tables, chairs, basic lighting, sound system, air conditioning, parking, and access to our bridal suite. Catering, decorations, and additional services can be arranged separately.",
    },
    {
      question: "Do you provide catering services?",
      answer: "Yes, we have preferred catering partners who are familiar with our venue. You can also choose to bring your own caterer, subject to our guidelines and requirements.",
    },
    {
      question: "What is your cancellation policy?",
      answer: "Cancellations made 90+ days before the event receive a full refund minus a processing fee. Cancellations made 30-89 days before receive a 50% refund. Cancellations within 30 days are non-refundable.",
    },
    {
      question: "Is there parking available?",
      answer: "Yes, we provide complimentary parking for up to 200 vehicles. Valet parking can also be arranged for an additional fee.",
    },
    {
      question: "Can I visit the venue before booking?",
      answer: "We encourage all potential clients to schedule a tour. Contact us to arrange a convenient time to visit and see our facilities.",
    },
    {
      question: "What is the maximum capacity?",
      answer: "Our main hall can accommodate up to 500 guests for a cocktail reception or 350 guests for a seated dinner. We also have smaller spaces available for intimate gatherings.",
    },
    {
      question: "Do you allow outside vendors?",
      answer: "Yes, you can bring your own vendors. All outside vendors must be licensed and insured, and we require vendor information at least 30 days before your event.",
    },
  ]

  return (
    <PublicLayout>
      {/* Hero Section - HOME */}
      <section id="home" className="relative min-h-[600px] bg-gray-900 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/venue-interior.jpg')`,
          }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="container mx-auto px-4 py-20 text-center relative z-10">
          <h1 className="mb-6 text-5xl font-bold drop-shadow-lg text-white">Welcome to One Estela Place</h1>
          <p className="mb-8 text-xl drop-shadow-md text-white">
            The perfect venue for your special events and celebrations
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <ReserveButton className="bg-white text-orange-600 hover:bg-gray-100 shadow-lg border-0" size="lg">
              Book Your Event
            </ReserveButton>
            <TourButton className="bg-amber-700 text-white hover:bg-amber-800 shadow-lg border-0" size="lg">
              Take a Tour
            </TourButton>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Why Choose One Estela Place?</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card className="text-center">
              <CardHeader>
                <MapPin className="mx-auto h-12 w-12 text-amber-700" />
                <CardTitle>Prime Location</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Located in the heart of the city with easy access and stunning views</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="mx-auto h-12 w-12 text-amber-700" />
                <CardTitle>Flexible Capacity</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Accommodates intimate gatherings to large celebrations up to 500 guests
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Calendar className="mx-auto h-12 w-12 text-amber-700" />
                <CardTitle>Easy Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Simple online booking system with real-time availability</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Star className="mx-auto h-12 w-12 text-amber-700" />
                <CardTitle>5-Star Service</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Professional staff dedicated to making your event unforgettable</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section - ABOUT */}
      <section id="about" className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold">About One Estela Place</h2>
              <p className="mb-4 text-gray-600">
                One Estela Place is a premier event venue that has been hosting memorable celebrations for over a
                decade. Our stunning architecture and versatile spaces provide the perfect backdrop for weddings,
                corporate events, and special occasions.
              </p>
              <p className="mb-6 text-gray-600">
                With state-of-the-art facilities, professional catering services, and a dedicated events team, we ensure
                every detail of your event is perfectly executed.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button className="bg-amber-700 text-white hover:bg-amber-800">
                  <a href="/about">Learn More About Us</a>
                </Button>
                <TourButton
                  variant="outline"
                  className="border-amber-700 text-amber-700 hover:bg-amber-700 hover:text-white"
                >
                  Virtual Tour
                </TourButton>
              </div>
            </div>
            <div className="h-96 rounded-lg overflow-hidden shadow-lg">
              <img
                src="/images/venue-chandelier.png"
                alt="Elegant chandelier at One Estela Place venue"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">What Our Clients Say</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mb-4 text-gray-600">
                  "One Estela Place was the perfect venue for our wedding. The staff was incredibly helpful and the
                  venue itself is stunning."
                </p>
                <p className="font-semibold">- Sarah Johnson</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mb-4 text-gray-600">
                  "Great venue for our company retreat. The facilities were excellent and the staff was very
                  accommodating."
                </p>
                <p className="font-semibold">- Michael Chen</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mb-4 text-gray-600">
                  "Had my 30th birthday here and it was amazing! The space is beautiful and everyone had a great time."
                </p>
                <p className="font-semibold">- Jessica Williams</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQs Section - FAQS */}
      <section id="faqs" className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-600">
              Find answers to common questions about booking at One Estela Place
            </p>
          </div>

          <div className="mx-auto max-w-3xl">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`} className="border rounded-lg px-6">
                  <AccordionTrigger className="py-4 text-left font-medium text-gray-900 hover:text-amber-700">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Contact Section - CONTACT */}
      <section id="contact" className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Get In Touch</h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-600">
              Have questions? Contact us and we'll get back to you as soon as possible
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h3 className="mb-6 text-2xl font-bold text-gray-900">Contact Information</h3>
              </div>

              <div className="flex items-start space-x-4">
                <MapPin className="mt-1 h-6 w-6 text-amber-700 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">Address</h4>
                  <p className="text-gray-600">123 Event Street, City, State 12345</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Phone className="mt-1 h-6 w-6 text-amber-700 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">Phone</h4>
                  <p className="text-gray-600">(555) 123-4567</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Mail className="mt-1 h-6 w-6 text-amber-700 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">Email</h4>
                  <p className="text-gray-600">info@oneestela.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Clock className="mt-1 h-6 w-6 text-amber-700 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">Business Hours</h4>
                  <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p className="text-gray-600">Saturday - Sunday: 10:00 AM - 4:00 PM</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Send us a Message</CardTitle>
                  <CardDescription>Fill out the form below and we'll get back to you within 24 hours</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="(555) 000-0000"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eventType">Event Type</Label>
                      <Input
                        id="eventType"
                        name="eventType"
                        placeholder="Wedding, Birthday, Corporate, etc."
                        value={formData.eventType}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eventDate">Preferred Event Date</Label>
                      <Input
                        id="eventDate"
                        name="eventDate"
                        type="date"
                        value={formData.eventDate}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Tell us about your event..."
                        rows={5}
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-1"
                      />
                      <label htmlFor="terms" className="text-sm text-gray-600">
                        I agree to the{" "}
                        <button
                          type="button"
                          onClick={() => setShowTerms(true)}
                          className="text-amber-700 hover:underline"
                        >
                          terms and conditions
                        </button>
                      </label>
                    </div>

                    <Button type="submit" className="w-full bg-amber-700 hover:bg-amber-800 text-white">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <TermsDialog open={showTerms} onOpenChange={setShowTerms} />
      </section>

      {/* CTA Section with Chandelier Background */}
      <section className="relative py-16 bg-gray-900 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/cta-background.png')`,
          }}
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="mb-4 text-3xl font-bold drop-shadow-lg text-white">Ready to Book Your Event?</h2>
          <p className="mb-8 text-xl drop-shadow-md text-white">
            Take a virtual tour first, then contact us to start planning your perfect event
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <TourButton className="bg-amber-700 text-white hover:bg-amber-800 shadow-lg border-0" size="lg">
              Take Virtual Tour
            </TourButton>
            <ReserveButton className="bg-amber-700 text-white hover:bg-amber-800 shadow-lg border-0" size="lg">
              Book Now
            </ReserveButton>
            <Button
              size="lg"
              className="bg-amber-700 text-white hover:bg-amber-800 border-2 border-amber-700 shadow-lg"
              onClick={() => {
                const element = document.querySelector("#contact")
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" })
                }
              }}
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}