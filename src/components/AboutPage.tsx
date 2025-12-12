import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  Heart, 
  Users, 
  Shield,
  Award,
  Globe,
  Phone,
  Mail,
  MapPin,
  Clock,
  Star,
  CheckCircle,
  Target,
  Zap,
  Building2,
  Calendar
} from "lucide-react";

export function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-pink-600 text-white py-20">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About BloodConnect
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
            We're on a mission to save lives by connecting blood donors with those in need 
            through innovative technology and compassionate care.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm">
            <Calendar className="w-4 h-4" />
            <span>Founded in 2020</span>
            <span>•</span>
            <Users className="w-4 h-4" />
            <span>50,000+ Lives Saved</span>
            <span>•</span>
            <Globe className="w-4 h-4" />
            <span>Nationwide Network</span>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="max-w-4xl mx-auto">
            <Card className="border-red-200">
              <CardContent className="py-12">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <Heart className="w-10 h-10 text-red-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    To revolutionize blood donation by creating a seamless, technology-driven platform 
                    that connects donors and patients instantly, ensuring no life is lost due to blood shortage.
                  </p>
                  <div className="grid md:grid-cols-3 gap-8 mt-12">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Target className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold mb-2">Accessibility</h3>
                      <p className="text-sm text-gray-600">Make blood donation accessible to everyone, everywhere</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Zap className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-bold mb-2">Speed</h3>
                      <p className="text-sm text-gray-600">Reduce response time from days to minutes</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Shield className="w-6 h-6 text-orange-600" />
                      </div>
                      <h3 className="font-bold mb-2">Trust</h3>
                      <p className="text-sm text-gray-600">Maintain highest standards of safety and privacy</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Statistics */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Impact by Numbers
            </h2>
            <p className="text-lg text-gray-600">
              See how BloodConnect has made a difference since our launch
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardContent className="py-8">
                <div className="text-4xl font-bold text-red-600 mb-2">50K+</div>
                <div className="text-sm text-gray-600">Lives Saved</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="py-8">
                <div className="text-4xl font-bold text-blue-600 mb-2">25K+</div>
                <div className="text-sm text-gray-600">Active Donors</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="py-8">
                <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
                <div className="text-sm text-gray-600">Partner Hospitals</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="py-8">
                <div className="text-4xl font-bold text-orange-600 mb-2">2 min</div>
                <div className="text-sm text-gray-600">Avg Response Time</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-gray-600">
              Healthcare professionals and technology experts working together to save lives
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-red-600">DR</span>
                </div>
                <CardTitle>Dr. Rachel Thompson</CardTitle>
                <CardDescription>Chief Medical Officer</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Former emergency medicine physician with 15+ years of experience in blood bank management 
                  and transfusion medicine.
                </p>
                <div className="text-sm text-gray-500">
                  MD, Harvard Medical School • Board Certified
                </div>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">MK</span>
                </div>
                <CardTitle>Michael Kim</CardTitle>
                <CardDescription>Chief Technology Officer</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Software architect specializing in healthcare technology and secure patient data systems 
                  with HIPAA compliance expertise.
                </p>
                <div className="text-sm text-gray-500">
                  MS Computer Science, Stanford • 12 years HealthTech
                </div>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">SL</span>
                </div>
                <CardTitle>Sarah Lopez</CardTitle>
                <CardDescription>Director of Operations</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Healthcare operations expert with extensive experience in blood bank coordination 
                  and emergency response logistics.
                </p>
                <div className="text-sm text-gray-500">
                  MBA Healthcare Management • Former Red Cross Director
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Partnerships */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted Partners
            </h2>
            <p className="text-lg text-gray-600">
              Working with leading healthcare organizations to expand our impact
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="text-center hover:shadow-md transition-shadow">
              <CardContent className="py-6">
                <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Building2 className="w-8 h-8 text-red-600" />
                </div>
                <h4 className="font-medium">American Red Cross</h4>
                <p className="text-sm text-gray-500">National Partnership</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-md transition-shadow">
              <CardContent className="py-6">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="font-medium">Blood Centers of America</h4>
                <p className="text-sm text-gray-500">Regional Network</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-md transition-shadow">
              <CardContent className="py-6">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="font-medium">AABB Association</h4>
                <p className="text-sm text-gray-500">Standards Certification</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-md transition-shadow">
              <CardContent className="py-6">
                <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-8 h-8 text-orange-600" />
                </div>
                <h4 className="font-medium">FDA Compliance</h4>
                <p className="text-sm text-gray-500">Safety Standards</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Awards & Recognition */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Awards & Recognition
            </h2>
            <p className="text-lg text-gray-600">
              Recognized for innovation in healthcare technology and life-saving impact
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-yellow-600" />
                </div>
                <CardTitle>Healthcare Innovation Award</CardTitle>
                <CardDescription>2023 • American Hospital Association</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Recognized for developing breakthrough technology that has reduced blood shortage 
                  response times by 85% nationwide.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle>Top Health App</CardTitle>
                <CardDescription>2023 • Digital Health Awards</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Selected as the top healthcare application for patient outcomes and user experience 
                  in the life sciences category.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle>Humanitarian Impact</CardTitle>
                <CardDescription>2024 • Global Health Foundation</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Honored for exceptional humanitarian impact through technology innovation 
                  that has saved over 50,000 lives globally.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-red-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-gray-600">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <Heart className="w-12 h-12 text-red-600 mb-3" />
                <CardTitle>Compassion</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Every decision we make is driven by empathy and the desire to help others in their time of need.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <Shield className="w-12 h-12 text-blue-600 mb-3" />
                <CardTitle>Trust</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We maintain the highest standards of security, privacy, and medical compliance to earn trust.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <Zap className="w-12 h-12 text-green-600 mb-3" />
                <CardTitle>Innovation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We continuously innovate to solve healthcare challenges with cutting-edge technology.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <Users className="w-12 h-12 text-orange-600 mb-3" />
                <CardTitle>Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Building strong communities of donors and healthcare providers working together.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Contact Us
            </h2>
            <p className="text-lg text-gray-600">
              Get in touch with our team for support, partnerships, or general inquiries
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Contact Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
                <CardDescription>
                  Multiple ways to reach our support team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <div className="font-medium">Emergency Hotline</div>
                      <div className="text-sm text-gray-600">1-800-BLOOD-911 (24/7)</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">General Support</div>
                      <div className="text-sm text-gray-600">(555) 123-BLOOD</div>
                      <div className="text-xs text-gray-500">Mon-Fri 8AM-6PM EST</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">Email Support</div>
                      <div className="text-sm text-gray-600">support@bloodconnect.org</div>
                      <div className="text-xs text-gray-500">Response within 2 hours</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-medium">Partnership Inquiries</div>
                      <div className="text-sm text-gray-600">partners@bloodconnect.org</div>
                      <div className="text-xs text-gray-500">Hospital & clinic partnerships</div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button className="flex-1 bg-red-600 hover:bg-red-700">
                      <Mail className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Phone className="w-4 h-4 mr-2" />
                      Schedule Call
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>
                  Learn more about BloodConnect
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                    <div>
                      <div className="font-medium">Headquarters</div>
                      <div className="text-sm text-gray-600">
                        123 Health Innovation Drive<br />
                        New York, NY 10001
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Clock className="w-5 h-5 text-gray-500 mt-1" />
                    <div>
                      <div className="font-medium">Support Hours</div>
                      <div className="text-sm text-gray-600">
                        Mon-Fri: 8:00 AM - 6:00 PM EST<br />
                        Emergency: 24/7
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Shield className="w-5 h-5 text-gray-500 mt-1" />
                    <div>
                      <div className="font-medium">Certifications</div>
                      <div className="text-sm text-gray-600">
                        HIPAA Compliant<br />
                        SOC 2 Type II<br />
                        FDA Registered
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Globe className="w-5 h-5 text-gray-500 mt-1" />
                    <div>
                      <div className="font-medium">Coverage Area</div>
                      <div className="text-sm text-gray-600">
                        50 US States<br />
                        500+ Partner Facilities<br />
                        24/7 Emergency Network
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <div className="text-center">
                    <Button variant="outline" className="w-full">
                      Download Press Kit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Join Our Life-Saving Mission
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Whether you're a donor, healthcare provider, or organization, there's a place for you 
            in our community dedicated to saving lives.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100">
              <Heart className="w-5 h-5 mr-2" />
              Become a Donor
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-red-600">
              <Building2 className="w-5 h-5 mr-2" />
              Partner with Us
            </Button>
          </div>

          <div className="mt-8">
            <p className="text-sm opacity-75">
              Together, we can ensure that no life is lost due to blood shortage
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}