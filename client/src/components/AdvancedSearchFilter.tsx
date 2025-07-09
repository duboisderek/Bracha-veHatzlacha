import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Calendar as CalendarIcon, 
  X, 
  Settings,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface FilterOptions {
  searchTerm: string;
  status: 'all' | 'pending' | 'approved' | 'rejected';
  currency: string;
  dateFrom?: Date;
  dateTo?: Date;
  amountMin?: string;
  amountMax?: string;
}

interface AdvancedSearchFilterProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  totalItems: number;
  filteredItems: number;
}

export function AdvancedSearchFilter({ 
  filters, 
  onFiltersChange, 
  totalItems, 
  filteredItems 
}: AdvancedSearchFilterProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tempFilters, setTempFilters] = useState(filters);

  const currencies = ['all', 'BTC', 'ETH', 'LTC', 'USDT', 'USDC'];

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...tempFilters, [key]: value };
    setTempFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters: FilterOptions = {
      searchTerm: '',
      status: 'all',
      currency: 'all',
      dateFrom: undefined,
      dateTo: undefined,
      amountMin: '',
      amountMax: ''
    };
    setTempFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.status !== 'all') count++;
    if (filters.currency !== 'all') count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    if (filters.amountMin) count++;
    if (filters.amountMax) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Basic Search Row */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <Label htmlFor="search" className="text-sm font-medium">Rechercher</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Email, nom, hash de transaction..."
                  value={filters.searchTerm}
                  onChange={(e) => updateFilter('searchTerm', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-48">
              <Label className="text-sm font-medium">Statut</Label>
              <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="approved">Approuvés</SelectItem>
                  <SelectItem value="rejected">Rejetés</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Currency Filter */}
            <div className="w-full md:w-32">
              <Label className="text-sm font-medium">Devise</Label>
              <Select value={filters.currency} onValueChange={(value) => updateFilter('currency', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map(currency => (
                    <SelectItem key={currency} value={currency}>
                      {currency === 'all' ? 'Toutes' : currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Advanced Toggle */}
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="h-10"
              >
                <Settings className="w-4 h-4 mr-2" />
                Avancé
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
                {showAdvanced ? (
                  <ChevronUp className="w-4 h-4 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-2" />
                )}
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t pt-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Date From */}
                  <div>
                    <Label className="text-sm font-medium">Date de début</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal mt-1"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.dateFrom ? 
                            filters.dateFrom.toLocaleDateString('fr-FR') : 
                            "Sélectionner"
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={filters.dateFrom}
                          onSelect={(date) => updateFilter('dateFrom', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Date To */}
                  <div>
                    <Label className="text-sm font-medium">Date de fin</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal mt-1"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.dateTo ? 
                            filters.dateTo.toLocaleDateString('fr-FR') : 
                            "Sélectionner"
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={filters.dateTo}
                          onSelect={(date) => updateFilter('dateTo', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Amount Min */}
                  <div>
                    <Label htmlFor="amountMin" className="text-sm font-medium">Montant min</Label>
                    <Input
                      id="amountMin"
                      type="number"
                      placeholder="0.00"
                      value={filters.amountMin || ''}
                      onChange={(e) => updateFilter('amountMin', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  {/* Amount Max */}
                  <div>
                    <Label htmlFor="amountMax" className="text-sm font-medium">Montant max</Label>
                    <Input
                      id="amountMax"
                      type="number"
                      placeholder="1000000.00"
                      value={filters.amountMax || ''}
                      onChange={(e) => updateFilter('amountMax', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="flex justify-end mt-4">
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    disabled={activeFilterCount === 0}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Effacer tous les filtres
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-2">
            <div>
              Affichage de {filteredItems} sur {totalItems} éléments
              {activeFilterCount > 0 && (
                <span className="ml-2">
                  ({activeFilterCount} filtre{activeFilterCount > 1 ? 's' : ''} actif{activeFilterCount > 1 ? 's' : ''})
                </span>
              )}
            </div>
            
            {/* Active Filters */}
            {activeFilterCount > 0 && (
              <div className="flex gap-1">
                {filters.status !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    Statut: {filters.status}
                  </Badge>
                )}
                {filters.currency !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    {filters.currency}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}