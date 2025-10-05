'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Phone, MapPin, Share2, Hospital, Stethoscope, FlaskConical, Building, MoreVertical, Search, Filter, AlertCircle } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

const serviceTypes = {
  pharmacy: { icon: Building, label: "Pharmacy" },
  hospital: { icon: Hospital, label: "Hospital" },
  clinic: { icon: Stethoscope, label: "Clinic" },
  lab: { icon: FlaskConical, label: "Lab" },
};

const mockServices = [
  {
      "id":"svc_gplaces_12345",
      "name":"Qadir Pharmacy",
      "service_type":"pharmacy",
      "primary_phone":"+92-300-1234567",
      "address":"Street 10, Johar Town, Lahore",
      "distance_m":420,
      "open_now":true,
      "confidence":0.82,
      "explainability":"Found in Google Places and Punjab Health Registry, near you (420m). Open now."
    },
    {
      "id":"svc_gplaces_67890",
      "name":"Shaukat Khanum Memorial Cancer Hospital",
      "service_type":"hospital",
      "primary_phone":"+92-42-35905000",
      "address":"7A Block R-3, Johar Town, Lahore",
      "distance_m":1200,
      "open_now":true,
      "confidence":0.95,
      "explainability":"Major hospital, officially registered. Open 24/7 for emergencies."
    },
    {
      "id":"svc_osm_11223",
      "name":"Dr. Amara's Clinic",
      "service_type":"clinic",
      "primary_phone":"+92-333-1122334",
      "address":"Model Town Link Road, Lahore",
      "distance_m":2500,
      "open_now":false,
      "confidence":0.65,
      "explainability":"Listed on Google Maps. Hours may vary."
    },
    {
      "id":"svc_user_44556",
      "name":"Chughtai Lab",
      "service_type":"lab",
      "primary_phone":"+92-42-111-255-790",
      "address":"Main Boulevard, Gulberg, Lahore",
      "distance_m":4500,
      "open_now":true,
      "confidence":0.90,
      "explainability":"Well-known lab chain, officially registered."
    },
    {
      "id":"svc_osm_99887",
      "name":"Local Medical Store",
      "service_type":"pharmacy",
      "primary_phone":null,
      "address":"Near Akbar Chowk, Faisal Town",
      "distance_m":800,
      "open_now":true,
      "confidence":0.40,
      "explainability":"User-reported location. Details not verified."
    }
];

const getConfidenceColor = (confidence: number) => {
  if (confidence > 0.75) return 'bg-green-500';
  if (confidence > 0.45) return 'bg-amber-500';
  return 'bg-red-500';
};

const ServiceCard = ({ service }: { service: typeof mockServices[0] }) => {
  const ServiceIcon = serviceTypes[service.service_type as keyof typeof serviceTypes]?.icon || Building;

  return (
    <Card className="hover:shadow-md transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-secondary rounded-lg">
                <ServiceIcon className="h-5 w-5 text-secondary-foreground" />
             </div>
             <div>
                <CardTitle className="font-body text-lg">{service.name}</CardTitle>
                <CardDescription className="text-xs">{serviceTypes[service.service_type as keyof typeof serviceTypes]?.label}</CardDescription>
             </div>
          </div>
           <Popover>
            <PopoverTrigger asChild>
               <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2">
              <Button variant="ghost" className="w-full justify-start"><Share2 className="mr-2 h-4 w-4" /> Share</Button>
              <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive"><AlertCircle className="mr-2 h-4 w-4" /> Report</Button>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
           <Badge variant="outline" className="font-mono">{service.distance_m} m</Badge>
           {service.open_now ? (
             <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">Open</Badge>
           ) : (
              <Badge variant="destructive">Closed</Badge>
           )}
            <div className="flex items-center gap-1.5" title={`Confidence: ${service.confidence}`}>
                <span className={cn("h-3 w-3 rounded-full", getConfidenceColor(service.confidence))}></span>
                <span className="text-xs text-muted-foreground">{service.confidence.toFixed(2)}</span>
            </div>
        </div>

        <p className="text-xs text-muted-foreground p-2 bg-secondary rounded-md border">{service.explainability}</p>

        <div className="flex gap-2">
            {service.primary_phone && (
                <a href={`tel:${service.primary_phone}`} className="w-full">
                    <Button variant="outline" className="w-full">
                        <Phone className="mr-2 h-4 w-4" /> Call
                    </Button>
                </a>
            )}
             <a href={`https://www.google.com/maps/search/?api=1&query=${service.address}`} target="_blank" rel="noopener noreferrer" className="w-full">
                <Button className="w-full">
                    <MapPin className="mr-2 h-4 w-4" /> Directions
                </Button>
            </a>
        </div>
      </CardContent>
    </Card>
  );
};


export default function PharmacyList() {
  const [loading, setLoading] = useState(true);
  const [hasLocation, setHasLocation] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>(Object.keys(serviceTypes));


  useEffect(() => {
    // Simulate asking for location and loading data
    setTimeout(() => {
      setHasLocation(true);
      setLoading(false);
    }, 1500);
  }, []);

  const toggleFilter = (filter: string) => {
      setActiveFilters(prev => 
        prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
      )
  }

  const renderLoading = () => (
    <div className="text-center text-muted-foreground space-y-2">
        <p>Detecting your location...</p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
                <Card key={i}>
                    <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                    <CardContent className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                         <div className="flex gap-2"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></div>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
  );

  const renderNoLocation = () => (
     <Card className="text-center p-8">
        <CardTitle>Location permission needed</CardTitle>
        <CardDescription className="mt-2">Please allow location access to find nearby health services.</CardDescription>
        <Button className="mt-4" onClick={() => { setLoading(true); setTimeout(() => { setHasLocation(true); setLoading(false); }, 1000)}}>Allow Location</Button>
    </Card>
  )

  const renderContent = () => (
    <>
         <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-4 mb-6">
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input placeholder="Search by name or specialty..." className="w-full pl-10 pr-4 py-2 border rounded-full bg-secondary"/>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
                {Object.entries(serviceTypes).map(([key, {label}]) => (
                     <Button 
                        key={key} 
                        variant={activeFilters.includes(key) ? "default" : "outline"}
                        onClick={() => toggleFilter(key)}
                        className="rounded-full"
                    >
                        {label}
                    </Button>
                ))}
                 <Button variant="outline" className="rounded-full">Open Now</Button>
                 <div className="flex gap-2 ml-auto pl-4">
                    <Button variant="ghost" size="sm" onClick={() => setActiveFilters([])}>Clear All</Button>
                    <Button variant="ghost" size="sm" onClick={() => setActiveFilters(Object.keys(serviceTypes))}>Select All</Button>
                 </div>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {mockServices
                .filter(service => activeFilters.length === 0 ? false : activeFilters.includes(service.service_type))
                .map((service) => (
                    <ServiceCard key={service.id} service={service} />
            ))}
        </div>
         {activeFilters.length > 0 && mockServices.filter(service => activeFilters.includes(service.service_type)).length === 0 && (
            <div className="text-center py-10 col-span-full">
                <p className="text-muted-foreground">No services found for the selected filters.</p>
            </div>
        )}
    </>
  );

  return (
    <div className="space-y-8">
        <header>
            <h2 className="text-3xl font-bold tracking-tight font-headline">
                Nearby Health Services
            </h2>
            <p className="text-muted-foreground">
                Verified pharmacies, clinics, and hospitals near you.
            </p>
        </header>
        
        {loading ? renderLoading() : hasLocation ? renderContent() : renderNoLocation()}
    </div>
  );
}
