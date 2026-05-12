"use client"

import type React from "react"
import { PublicLayout } from "@/components/public-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Calendar, MapPin, Users, Star } from "lucide-react"
import { ReserveButton } from "@/components/reserve-button"
import { TourButton } from "@/components/tour-button"

export default function HomePage() {
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
            <ReserveButton className="bg-white text-amber-700 hover:bg-gray-100 shadow-lg border-0" size="lg">
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
            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <MapPin className="mx-auto h-12 w-12 text-amber-600" />
                <CardTitle>Prime Location</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Located in the heart of the city with easy access and stunning views</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <Users className="mx-auto h-12 w-12 text-amber-600" />
                <CardTitle>Flexible Capacity</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Accommodates intimate gatherings to large celebrations up to 500 guests
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <Calendar className="mx-auto h-12 w-12 text-amber-600" />
                <CardTitle>Easy Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Simple online booking system with real-time availability</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <Star className="mx-auto h-12 w-12 text-amber-600" />
                <CardTitle>5-Star Service</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Professional staff dedicated to making your event unforgettable</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* EXPANDED ABOUT SECTION - DIRECTLY VISIBLE NA */}
      <section id="about" className="bg-gray-50 py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="mb-4 text-4xl font-bold text-gray-900">Our Story</h2>
              <div className="w-20 h-1.5 bg-amber-600 rounded-full mb-8"></div>
              
              <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
                <p>
                  Founded in 2014, One Estela Place began as a vision to create a space where life's most precious moments could be celebrated in style. Named after the founder's grandmother, Estela, our venue embodies the warmth, elegance, and hospitality that she was known for.
                </p>
                <p>
                  What started as a single event space has grown into a comprehensive venue offering multiple rooms, state-of-the-art facilities, and a team of dedicated professionals who are passionate about making every event extraordinary.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-10 pt-8 border-t border-gray-200">
                <div>
                  <div className="text-4xl font-bold text-gray-900">2000+</div>
                  <div className="mt-1 text-sm font-semibold text-amber-600 uppercase tracking-wider">Events Hosted</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-gray-900">10+</div>
                  <div className="mt-1 text-sm font-semibold text-amber-600 uppercase tracking-wider">Years Experience</div>
                </div>
              </div>
            </div>
            
            <div className="relative h-[550px] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/images/venue-chandelier.png"
                alt="Elegant chandelier at One Estela Place venue"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faqs" className="bg-white py-20 border-t border-gray-100">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600">
              Find answers to common questions about booking at One Estela Place
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`faq-${index}`} className="border border-gray-200 rounded-xl px-6 bg-white shadow-sm hover:shadow transition-shadow">
                <AccordionTrigger className="py-5 text-left font-semibold text-gray-900 hover:text-amber-700 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </PublicLayout>
  )
}