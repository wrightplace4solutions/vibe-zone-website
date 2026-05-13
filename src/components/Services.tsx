import { Music, Radio, Headphones, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const services = [
  {
    icon: Music,
    title: "Line Dance Specialist",
    description: "Experienced with Urban line dance classics and latest hits that get everyone on the floor",
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
    <section className="py-14 md:py-20 px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/50 to-background"></div>
      
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-10 md:mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
            <span className="text-neon-cyan">Our</span>{" "}
            <span className="text-neon-orange">Services</span>
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Professional DJ entertainment tailored for line dance and trail ride enthusiasts
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card 
                key={index}
                className="bg-card/55 backdrop-blur border-border/80 animate-fade-in transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-card/70"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-5 md:p-6 text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-background/80 border border-border mb-4 ${service.color}`}>
                    <Icon className="w-6 h-6 md:w-7 md:h-7" />
                  </div>
                  <h3 className="text-base md:text-lg font-bold mb-2 text-foreground leading-snug">{service.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
