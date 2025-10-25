import { Music, Radio, Headphones, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const services = [
  {
    icon: Music,
    title: "Line Dance Specialist",
    description: "Expert in country line dance classics and latest hits that get everyone on the floor",
    color: "text-neon-cyan",
  },
  {
    icon: Radio,
    title: "Trail Ride Anthems",
    description: "Curated selection of trail ride favorites and Southern classics for unforgettable events",
    color: "text-neon-orange",
  },
  {
    icon: Headphones,
    title: "Professional DJ Services",
    description: "High-quality sound systems and seamless mixing for events of all sizes",
    color: "text-neon-cyan",
  },
  {
    icon: Zap,
    title: "Interactive Experience",
    description: "Powered by the Vibe Que app for real-time song requests and crowd engagement",
    color: "text-neon-orange",
  },
];

export const Services = () => {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/50 to-background"></div>
      
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="text-neon-cyan">Our</span>{" "}
            <span className="text-neon-orange">Services</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional DJ entertainment tailored for line dance and trail ride enthusiasts
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card 
                key={index}
                className="bg-card/50 backdrop-blur border-border hover:border-primary/50 transition-all duration-300 hover:scale-105 group animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-background mb-4 ${service.color} group-hover:glow-neon transition-all`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">{service.title}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
