import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { watchlistService, Watchlist } from '@/services/watchlist.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, X } from 'lucide-react';

export default function WatchlistsPage() {
  const [selectedWatchlist, setSelectedWatchlist] = useState<string | null>(null);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [symbolInput, setSymbolInput] = useState('');
  const queryClient = useQueryClient();

  const { data: watchlists, isLoading } = useQuery({
    queryKey: ['watchlists'],
    queryFn: () => watchlistService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => watchlistService.create({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
      setNewWatchlistName('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => watchlistService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
      if (selectedWatchlist === id) setSelectedWatchlist(null);
    },
  });

  const addSymbolMutation = useMutation({
    mutationFn: ({ id, symbol }: { id: string; symbol: string }) =>
      watchlistService.addSymbol(id, symbol),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
      setSymbolInput('');
    },
  });

  const removeSymbolMutation = useMutation({
    mutationFn: ({ id, symbol }: { id: string; symbol: string }) =>
      watchlistService.removeSymbol(id, symbol),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
    },
  });

  const handleCreateWatchlist = () => {
    if (newWatchlistName.trim()) {
      createMutation.mutate(newWatchlistName.trim());
    }
  };

  const handleAddSymbol = () => {
    if (selectedWatchlist && symbolInput.trim()) {
      addSymbolMutation.mutate({ id: selectedWatchlist, symbol: symbolInput.trim().toUpperCase() });
    }
  };

  const selectedList = watchlists?.find((w) => w._id === selectedWatchlist);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Watchlists</h1>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="New watchlist name..."
            value={newWatchlistName}
            onChange={(e) => setNewWatchlistName(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            onKeyDown={(e) => e.key === 'Enter' && handleCreateWatchlist()}
          />
          <button
            onClick={handleCreateWatchlist}
            disabled={!newWatchlistName.trim() || createMutation.isPending}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Your Watchlists</h2>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : !watchlists?.length ? (
            <p className="text-muted-foreground">No watchlists yet. Create one above.</p>
          ) : (
            <div className="space-y-2">
              {watchlists.map((watchlist) => (
                <Card
                  key={watchlist._id}
                  className={`cursor-pointer transition-colors ${
                    selectedWatchlist === watchlist._id ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setSelectedWatchlist(watchlist._id)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{watchlist.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {watchlist.symbols.length} stocks
                      </div>
                    </div>
                    {!watchlist.isDefault && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate(watchlist._id);
                        }}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">
            {selectedList ? selectedList.name : 'Select a watchlist'}
          </h2>
          {selectedList ? (
            <Card>
              <CardHeader>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add symbol (e.g., RELIANCE)"
                    value={symbolInput}
                    onChange={(e) => setSymbolInput(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSymbol()}
                  />
                  <button
                    onClick={handleAddSymbol}
                    disabled={!symbolInput.trim() || addSymbolMutation.isPending}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {selectedList.symbols.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No stocks in this watchlist. Add symbols above.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedList.symbols.map((symbol) => (
                      <div
                        key={symbol}
                        className="flex items-center justify-between p-3 border rounded-md"
                      >
                        <span className="font-medium">{symbol}</span>
                        <button
                          onClick={() =>
                            removeSymbolMutation.mutate({ id: selectedList._id, symbol })
                          }
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Select a watchlist from the left to view and manage its contents.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
