import { getAllPlayersWithNames } from '@/api';
import React, { useEffect, useState } from 'react';

interface LabelValue {
    value: string;
    label: string;
}

const FilterableCombobox: React.FC = () => {
  const [items, setItems] = useState<LabelValue[]>([]);        // All items from the backend
  const [filteredItems, setFilteredItems] = useState<LabelValue[]>([]);  // Filtered items to display
  const [searchTerm, setSearchTerm] = useState<string>('');  // Search term entered by user
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);  // Dropdown visibility

  // Fetch items from the backend when the component mounts
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await getAllPlayersWithNames()
        const playersList = response.data
        const shortPlayers = playersList.slice(0, 100)

        const playerLabelValue = shortPlayers.map((player: { id: number; name: string }) => ({
            value: player.id.toString(),
            label: player.name,
        }));

        console.log(playerLabelValue)
        
        setItems(playerLabelValue);
        setFilteredItems(playerLabelValue);  // Initially, show all items
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    fetchItems();
  }, []); // Empty dependency array ensures this effect runs once on mount

  // Handle input change to filter items based on the search term
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const lowerCasedSearchTerm = searchTerm.toLowerCase();
      const filtered = items.filter((item) =>
        item.label.toLowerCase().includes(lowerCasedSearchTerm)
      );
      setFilteredItems(filtered);
    }, 300);  // Debounce filtering with 300ms delay

    return () => clearTimeout(timeoutId);  // Clean up timeout on search term change
  }, [searchTerm, items]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsDropdownOpen(true);  // Open dropdown on typing
  };

  const handleItemSelect = (item: LabelValue) => {
    console.log(item)
    setSearchTerm(item.label);  // Set selected item name in the input
    setIsDropdownOpen(false);  // Close the dropdown
  };

  return (
    <div className="relative w-64">
      <input
        type="text"
        className="w-full border border-gray-300 rounded-lg p-2"
        placeholder="Search..."
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => setIsDropdownOpen(true)}
      />

      {isDropdownOpen && (
        <div className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item.value}
                className="cursor-pointer p-2 hover:bg-gray-100"
                onClick={() => handleItemSelect(item)}
              >
                {item.label}
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500">No items found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterableCombobox;
