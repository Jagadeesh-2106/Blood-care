import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Heart, 
  Trophy, 
  TrendingUp, 
  Calendar,
  Award,
  Users,
  Droplets,
  Target,
  Download,
  Share2,
  Star,
  CheckCircle
} from "lucide-react";
// Simple chart replacements for better compatibility
const SimpleLineChart = ({ data, height = 300 }: { data: any[], height?: number }) => (
  <div className="w-full bg-gray-50 rounded-lg p-4 flex items-center justify-center" style={{ height }}>
    <div className="text-center text-gray-600">
      <TrendingUp className="w-8 h-8 mx-auto mb-2" />
      <p className="text-sm">Chart visualization</p>
      <p className="text-xs">{data.length} data points</p>
    </div>
  </div>
);

const SimpleBarChart = ({ data, height = 300 }: { data: any[], height?: number }) => (
  <div className="w-full bg-gray-50 rounded-lg p-4 flex items-center justify-center" style={{ height }}>
    <div className="text-center text-gray-600">
      <div className="w-8 h-8 mx-auto mb-2 bg-blue-100 rounded flex items-center justify-center">
        <div className="w-4 h-4 bg-blue-500 rounded"></div>
      </div>
      <p className="text-sm">Bar chart visualization</p>
      <p className="text-xs">{data.length} categories</p>
    </div>
  </div>
);

const SimplePieChart = ({ data, height = 300 }: { data: any[], height?: number }) => (
  <div className="w-full bg-gray-50 rounded-lg p-4 flex items-center justify-center" style={{ height }}>
    <div className="text-center text-gray-600">
      <div className="w-8 h-8 mx-auto mb-2 bg-red-100 rounded-full flex items-center justify-center">
        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
      </div>
      <p className="text-sm">Pie chart visualization</p>
      <p className="text-xs">{data.length} segments</p>
    </div>
  </div>
);

interface DonationImpactProps {
  userProfile: {
    id: string;
    fullName: string;
    bloodType?: string;
    role: string;
  };
}

interface DonationStats {
  totalDonations: number;
  livesSaved: number;
  totalUnits: number;
  lastDonationDate: string;
  nextEligibleDate: string;
  streak: number;
  achievements: Achievement[];
  monthlyData: MonthlyData[];
  impactByType: ImpactData[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedDate: string;
  category: 'milestone' | 'streak' | 'impact' | 'special';
}

interface MonthlyData {
  month: string;
  donations: number;
  livesSaved: number;
}

interface ImpactData {
  type: string;
  value: number;
  color: string;
}

const COLORS = ['#dc2626', '#ea580c', '#d97706', '#ca8a04', '#65a30d'];

const mockDonationStats: DonationStats = {
  totalDonations: 12,
  livesSaved: 36,
  totalUnits: 24,
  lastDonationDate: "2024-01-15",
  nextEligibleDate: "2024-04-15",
  streak: 8,
  achievements: [
    {
      id: '1',
      title: 'First Drop',
      description: 'Completed your first blood donation',
      icon: 'heart',
      unlockedDate: '2023-06-15',
      category: 'milestone'
    },
    {
      id: '2',
      title: 'Life Saver',
      description: 'Saved 10 lives through your donations',
      icon: 'trophy',
      unlockedDate: '2023-08-22',
      category: 'impact'
    },
    {
      id: '3',
      title: 'Consistent Donor',
      description: 'Maintained a 6-month donation streak',
      icon: 'target',
      unlockedDate: '2023-12-10',
      category: 'streak'
    },
    {
      id: '4',
      title: 'Community Hero',
      description: 'Reached 30+ lives saved milestone',
      icon: 'star',
      unlockedDate: '2024-01-15',
      category: 'milestone'
    }
  ],
  monthlyData: [
    { month: 'Jul 23', donations: 1, livesSaved: 3 },
    { month: 'Aug 23', donations: 1, livesSaved: 3 },
    { month: 'Sep 23', donations: 2, livesSaved: 6 },
    { month: 'Oct 23', donations: 1, livesSaved: 3 },
    { month: 'Nov 23', donations: 2, livesSaved: 6 },
    { month: 'Dec 23', donations: 1, livesSaved: 3 },
    { month: 'Jan 24', donations: 2, livesSaved: 6 },
    { month: 'Feb 24', donations: 1, livesSaved: 3 },
    { month: 'Mar 24', donations: 1, livesSaved: 3 }
  ],
  impactByType: [
    { type: 'Emergency Cases', value: 12, color: '#dc2626' },
    { type: 'Surgery Support', value: 8, color: '#ea580c' },
    { type: 'Cancer Treatment', value: 6, color: '#d97706' },
    { type: 'Accident Victims', value: 7, color: '#ca8a04' },
    { type: 'Regular Transfusions', value: 3, color: '#65a30d' }
  ]
};

export function DonationImpactDashboard({ userProfile }: DonationImpactProps) {
  const [stats, setStats] = useState<DonationStats>(mockDonationStats);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // In a real app, fetch donation statistics from the backend
    // For now, we'll use mock data
  }, [userProfile.id]);

  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'heart': return <Heart className="w-6 h-6" />;
      case 'trophy': return <Trophy className="w-6 h-6" />;
      case 'target': return <Target className="w-6 h-6" />;
      case 'star': return <Star className="w-6 h-6" />;
      default: return <Award className="w-6 h-6" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'milestone': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'streak': return 'bg-green-100 text-green-800 border-green-200';
      case 'impact': return 'bg-red-100 text-red-800 border-red-200';
      case 'special': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const calculateProgress = () => {
    const nextMilestone = Math.ceil(stats.totalDonations / 5) * 5;
    return (stats.totalDonations / nextMilestone) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Header with key metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 mb-1">Lives Saved</p>
                <p className="text-3xl font-bold text-red-700">{stats.livesSaved}</p>
                <p className="text-xs text-red-500 mt-1">
                  ~3 lives per donation
                </p>
              </div>
              <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 mb-1">Total Donations</p>
                <p className="text-3xl font-bold text-blue-700">{stats.totalDonations}</p>
                <p className="text-xs text-blue-500 mt-1">
                  {stats.totalUnits} units donated
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                <Droplets className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 mb-1">Current Streak</p>
                <p className="text-3xl font-bold text-green-700">{stats.streak}</p>
                <p className="text-xs text-green-500 mt-1">
                  months consistent
                </p>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 mb-1">Achievements</p>
                <p className="text-3xl font-bold text-purple-700">{stats.achievements.length}</p>
                <p className="text-xs text-purple-500 mt-1">
                  badges earned
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="impact">Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Donation Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Donation Timeline
                </CardTitle>
                <CardDescription>Your donation journey over time</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleLineChart data={stats.monthlyData} height={300} />
              </CardContent>
            </Card>

            {/* Next Donation */}
            <Card>
              <CardHeader>
                <CardTitle>Next Donation Eligibility</CardTitle>
                <CardDescription>When you can donate again</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-green-600">
                    {new Date(stats.nextEligibleDate).toLocaleDateString()}
                  </div>
                  <p className="text-sm text-gray-600">
                    Last donation: {new Date(stats.lastDonationDate).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Time until eligible</span>
                    <span className="font-medium">2 months</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>

                <Button className="w-full mt-4">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Next Donation
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Donation Milestones</CardTitle>
              <CardDescription>Your progress towards the next milestone</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Next Milestone: {Math.ceil(stats.totalDonations / 5) * 5} donations</span>
                  <span className="text-sm text-gray-600">{stats.totalDonations} / {Math.ceil(stats.totalDonations / 5) * 5}</span>
                </div>
                <Progress value={calculateProgress()} className="h-3" />
                <p className="text-xs text-gray-600">
                  {Math.ceil(stats.totalDonations / 5) * 5 - stats.totalDonations} more donations to reach your next milestone
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">{stats.totalUnits}L</div>
                  <div className="text-sm text-gray-600">Blood Donated</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">{stats.streak}x</div>
                  <div className="text-sm text-gray-600">Longest Streak</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart data={stats.monthlyData} height={300} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Your Achievements
              </CardTitle>
              <CardDescription>Badges earned through your donation journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {stats.achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                      {getAchievementIcon(achievement.icon)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{achievement.title}</h3>
                        <Badge className={getCategoryColor(achievement.category)}>
                          {achievement.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                      <p className="text-xs text-gray-500">
                        Unlocked on {new Date(achievement.unlockedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impact" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Impact by Use Case</CardTitle>
                <CardDescription>How your donations helped different medical needs</CardDescription>
              </CardHeader>
              <CardContent>
                <SimplePieChart data={stats.impactByType} height={300} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Impact Statistics</CardTitle>
                <CardDescription>Detailed breakdown of your contribution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.impactByType.map((impact, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: impact.color }}
                      ></div>
                      <span className="text-sm font-medium">{impact.type}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{impact.value}</div>
                      <div className="text-xs text-gray-500">lives helped</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Share Your Impact</CardTitle>
              <CardDescription>Let others know about your life-saving contributions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share on Social Media
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download Impact Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}