import { Card, CardContent } from "./ui/card";
import { TrendingUp, Users, Clock, MapPin } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "10,247",
    label: "Active Donors",
    change: "+23% this month",
    changeType: "positive"
  },
  {
    icon: TrendingUp,
    value: "1,586",
    label: "Lives Saved",
    change: "+156 this week",
    changeType: "positive"
  },
  {
    icon: Clock,
    value: "2.3 min",
    label: "Average Match Time",
    change: "-45% faster",
    changeType: "positive"
  },
  {
    icon: MapPin,
    value: "127",
    label: "Cities Covered",
    change: "+8 new cities",
    changeType: "positive"
  }
];

export function Statistics() {
  return (
    <section className="py-20 bg-red-600 text-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold">
            Making a Real Impact
          </h2>
          <p className="text-xl text-red-100 max-w-2xl mx-auto">
            See how our platform is transforming blood donation and saving lives across communities
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur border-white/20 hover:bg-white/20 transition-all duration-300">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-red-100">{stat.label}</div>
                </div>
                <div className="text-sm text-red-100 flex items-center justify-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16 text-center">
          <div>
            <div className="text-4xl font-bold mb-2">99.7%</div>
            <div className="text-red-100">Success Rate</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">24/7</div>
            <div className="text-red-100">Platform Availability</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">{"<30s"}</div>
            <div className="text-red-100">Emergency Response</div>
          </div>
        </div>
      </div>
    </section>
  );
}