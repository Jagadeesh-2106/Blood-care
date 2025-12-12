import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  Heart, 
  UserPlus, 
  Search, 
  Calendar,
  MapPin,
  Clock,
  Shield,
  Users,
  CheckCircle,
  ArrowRight,
  Phone,
  Star,
  Droplet
} from "lucide-react";

export function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-pink-600 text-white py-20">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            How BloodConnect Works
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
            Our platform connects blood donors with those in need through a simple, secure, and efficient process. 
            Learn how you can save lives in just a few clicks.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm">
            <Shield className="w-4 h-4" />
            <span>Secure & HIPAA Compliant</span>
            <span>•</span>
            <Users className="w-4 h-4" />
            <span>50,000+ Active Users</span>
            <span>•</span>
            <span>Available 24/7</span>
          </div>
        </div>
      </section>

      {/* Main Process Steps */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Simple Steps to Save Lives
            </h2>
            <p className="text-lg text-gray-600">
              Whether you're a donor or healthcare provider, our platform makes blood donation coordination seamless
            </p>
          </div>

          {/* For Donors */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <Badge className="bg-red-100 text-red-800 text-lg px-4 py-2">
                <Heart className="w-5 h-5 mr-2" />
                For Blood Donors
              </Badge>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="w-8 h-8 text-red-600" />
                  </div>
                  <CardTitle className="text-lg">1. Sign Up</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Create your profile with basic health information and blood type. 
                    Quick 2-minute registration process.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">2. Find Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Browse blood requests in your area or get notified when your blood type is needed urgently.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">3. Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Book an appointment at a nearby blood bank or donation center at your convenience.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-lg">4. Donate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Complete your donation and track the impact you've made on saving lives in your community.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* For Healthcare Providers */}
          <div>
            <div className="text-center mb-8">
              <Badge className="bg-blue-100 text-blue-800 text-lg px-4 py-2">
                <Users className="w-5 h-5 mr-2" />
                For Healthcare Providers
              </Badge>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">1. Verify</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Register your healthcare facility with proper credentials and verification process.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-red-600" />
                  </div>
                  <CardTitle className="text-lg">2. Post Request</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Submit blood requests with patient details, urgency level, and required blood type.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">3. Get Matches</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Our algorithm instantly matches you with eligible donors in your area based on compatibility.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-lg">4. Coordinate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Communicate with donors and coordinate donation logistics through our secure platform.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose BloodConnect?
            </h2>
            <p className="text-lg text-gray-600">
              Our platform offers unique features that make blood donation more efficient and accessible
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle>Real-Time Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Our advanced algorithm instantly matches blood requests with compatible donors in real-time, 
                  reducing wait times for critical patients.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Instant notifications</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Location-based matching</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Urgency prioritization</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Secure & Private</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  All health information is encrypted and HIPAA compliant. Your privacy and security 
                  are our top priorities.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>End-to-end encryption</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>HIPAA compliant</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Anonymous donor options</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Nationwide Network</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Access to thousands of certified blood banks, donation centers, and healthcare facilities 
                  across the country.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>500+ partner facilities</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>50 states coverage</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Mobile blood drives</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Emergency Process */}
      <section className="py-16 bg-red-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <Badge className="bg-red-600 text-white text-lg px-4 py-2 mb-4">
              Emergency Process
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Critical Blood Shortage Response
            </h2>
            <p className="text-lg text-gray-600">
              In emergency situations, our platform activates special protocols to ensure rapid response
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Instant Alert</h3>
                <p className="text-gray-600">
                  Emergency requests trigger immediate notifications to all compatible donors 
                  within a 25-mile radius via SMS, email, and push notifications.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Priority Scheduling</h3>
                <p className="text-gray-600">
                  Emergency donors get priority scheduling at all partner facilities with 
                  extended hours and expedited processing.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Rapid Delivery</h3>
                <p className="text-gray-600">
                  Coordinated logistics ensure blood reaches the hospital within 2 hours 
                  of donation through our emergency transport network.
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              <div className="bg-white p-6 rounded-lg shadow-md inline-block">
                <div className="flex items-center gap-4 text-red-600 mb-2">
                  <Phone className="w-6 h-6" />
                  <span className="text-xl font-bold">Emergency Hotline: 1-800-BLOOD-911</span>
                </div>
                <p className="text-sm text-gray-600">Available 24/7 for critical blood shortages</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-lg text-gray-600">
              Real stories from donors and patients who have used BloodConnect
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Sarah M., Regular Donor</CardTitle>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 italic">
                  "BloodConnect made it so easy to find donation opportunities near me. 
                  I've donated 8 times this year and helped save 24 lives. The app's 
                  notifications keep me informed about urgent needs in my community."
                </p>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <strong>Impact:</strong> 8 donations • 24 lives saved • 2 emergency responses
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle>Dr. James L., Emergency Physician</CardTitle>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 italic">
                  "BloodConnect has revolutionized how we handle blood shortages. Last month, 
                  we had a critical trauma case and needed O- blood urgently. The platform 
                  connected us with 5 donors within 30 minutes. It literally saved a life."
                </p>
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-800">
                    <strong>Result:</strong> 30-minute response time • 5 donor matches • Life saved
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Getting Started CTA */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Save Lives?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of donors and healthcare providers who are making a difference every day
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100">
              <Heart className="w-5 h-5 mr-2" />
              Register as Donor
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-red-600">
              <Users className="w-5 h-5 mr-2" />
              Healthcare Signup
            </Button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-8 text-sm opacity-90">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Free to use</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>HIPAA compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}