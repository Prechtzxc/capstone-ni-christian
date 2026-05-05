import { PublicLayout } from "@/components/public-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Award, Calendar, Heart } from "lucide-react"

export default function AboutPage() {
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <h1 className="mb-6 text-4xl font-bold text-gray-900">About One Estela Place</h1>
          <p className="mx-auto max-w-3xl text-lg text-gray-600">
            For over a decade, One Estela Place has been the premier destination for unforgettable events. Our
            commitment to excellence and attention to detail has made us the trusted choice for celebrations that matter
            most.
          </p>
        </div>

        {/* Story Section */}
        <div className="mb-16 grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="mb-6 text-3xl font-bold text-gray-900 text-center text-center">Our Story</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                Founded in 2014, One Estela Place began as a vision to create a space where life's most precious moments
                could be celebrated in style. Named after the founder's grandmother, Estela, our venue embodies the
                warmth, elegance, and hospitality that she was known for.
              </p>
              <p>
                What started as a single event space has grown into a comprehensive venue offering multiple rooms,
                state-of-the-art facilities, and a team of dedicated professionals who are passionate about making every
                event extraordinary.
              </p>
              <p>
                Today, we've had the honor of hosting over 2,000 events, from intimate gatherings to grand celebrations,
                each one unique and memorable in its own way.
              </p>
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

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">Our Values</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card className="text-center border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Heart className="mx-auto h-12 w-12 text-orange-500" />
                <CardTitle className="text-gray-900">Passion</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  We're passionate about creating magical moments that you'll treasure forever
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Award className="mx-auto h-12 w-12 text-orange-500" />
                <CardTitle className="text-gray-900">Excellence</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  We strive for perfection in every detail, from planning to execution
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="mx-auto h-12 w-12 text-orange-500" />
                <CardTitle className="text-gray-900">Service</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Our dedicated team goes above and beyond to exceed your expectations
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Calendar className="mx-auto h-12 w-12 text-orange-500" />
                <CardTitle className="text-gray-900">Reliability</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  You can count on us to deliver exactly what we promise, every time
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">Meet Our Team</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-gradient-to-br from-orange-400 to-amber-500"></div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">Maria Rodriguez</h3>
                <p className="mb-2 text-orange-500 font-medium">Event Director</p>
                <p className="text-sm text-gray-600">
                  With 15 years of experience in event planning, Maria ensures every detail is perfect.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-gradient-to-br from-orange-400 to-amber-500"></div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">James Wilson</h3>
                <p className="mb-2 text-orange-500 font-medium">Operations Manager</p>
                <p className="text-sm text-gray-600">
                  James oversees all venue operations and ensures everything runs smoothly.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-gradient-to-br from-orange-400 to-amber-500"></div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">Sarah Chen</h3>
                <p className="mb-2 text-orange-500 font-medium">Customer Relations</p>
                <p className="text-sm text-gray-600">
                  Sarah is your first point of contact and helps bring your vision to life.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Section */}
        <div className="rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 p-12 text-white shadow-xl">
          <h2 className="mb-8 text-center text-3xl font-bold">Our Achievements</h2>
          <div className="grid gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold">2000+</div>
              <div className="text-orange-100">Events Hosted</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold">10+</div>
              <div className="text-orange-100">Years of Experience</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold">4.9</div>
              <div className="text-orange-100">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold">500</div>
              <div className="text-orange-100">Max Capacity</div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
