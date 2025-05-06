import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, Users, Search, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface Party {
  id: string;
  name: string;
  address: string;
  mobile: string;
  adharNumber: string;
  panNumber: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  timestamp: number;
}

export function PartyManagement() {
  const [parties, setParties] = useState<Party[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editParty, setEditParty] = useState<Party | null>(null);
  const [partyToDelete, setPartyToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Form state
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [mobile, setMobile] = useState('');
  const [adharNumber, setAdharNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');

  // Load parties from localStorage on component mount
  useEffect(() => {
    loadParties();
  }, []);

  const loadParties = () => {
    try {
      const savedParties = localStorage.getItem('parties');
      if (savedParties) {
        const parsedParties = JSON.parse(savedParties);
        setParties(parsedParties);
      }
    } catch (error) {
      console.error("Error loading parties:", error);
      toast({
        title: "Error Loading Parties",
        description: "There was an error loading the parties. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Filter parties based on search term
  const filteredParties = parties.filter(party => 
    party.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    party.mobile.includes(searchTerm)
  );

  // Reset form fields
  const resetForm = () => {
    setName('');
    setAddress('');
    setMobile('');
    setAdharNumber('');
    setPanNumber('');
    setBankName('');
    setAccountNumber('');
    setIfscCode('');
  };

  // Open dialog for adding a new party
  const openAddDialog = () => {
    resetForm();
    setEditParty(null);
    setShowAddDialog(true);
  };

  // Open dialog for editing a party
  const openEditDialog = (party: Party) => {
    setEditParty(party);
    setName(party.name);
    setAddress(party.address);
    setMobile(party.mobile);
    setAdharNumber(party.adharNumber);
    setPanNumber(party.panNumber);
    setBankName(party.bankName);
    setAccountNumber(party.accountNumber);
    setIfscCode(party.ifscCode);
    setShowAddDialog(true);
  };

  // Save a new party or update existing party
  const saveParty = () => {
    if (name.trim() === '') {
      toast({
        title: "Name Required",
        description: "Please enter a party name.",
        variant: "destructive"
      });
      return;
    }

    try {
      let updatedParties: Party[] = [];
      const partyData: Party = {
        id: editParty ? editParty.id : crypto.randomUUID(),
        name,
        address,
        mobile,
        adharNumber,
        panNumber,
        bankName,
        accountNumber,
        ifscCode,
        timestamp: Date.now()
      };

      if (editParty) {
        // Update existing party
        updatedParties = parties.map(p => p.id === editParty.id ? partyData : p);
        toast({
          title: "Party Updated",
          description: `${name} has been updated successfully.`
        });
      } else {
        // Add new party
        updatedParties = [...parties, partyData];
        toast({
          title: "Party Added",
          description: `${name} has been added successfully.`
        });
      }

      localStorage.setItem('parties', JSON.stringify(updatedParties));
      setParties(updatedParties);
      setShowAddDialog(false);
      resetForm();
      setEditParty(null);
    } catch (error) {
      console.error("Error saving party:", error);
      toast({
        title: "Error Saving Party",
        description: "There was an error saving the party. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Confirm party deletion
  const confirmDeleteParty = () => {
    if (!partyToDelete) return;

    try {
      const updatedParties = parties.filter(party => party.id !== partyToDelete);
      localStorage.setItem('parties', JSON.stringify(updatedParties));
      setParties(updatedParties);
      
      toast({
        title: "Party Deleted",
        description: "The party has been deleted successfully."
      });
    } catch (error) {
      console.error("Error deleting party:", error);
      toast({
        title: "Error Deleting Party",
        description: "There was an error deleting the party. Please try again.",
        variant: "destructive"
      });
    } finally {
      setShowDeleteConfirm(false);
      setPartyToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Party Management</h2>
        <Button onClick={openAddDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Party
        </Button>
      </div>

      <div className="flex mb-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 h-4 w-4" />
          <Input 
            className="pl-10" 
            placeholder="Search by name or mobile" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredParties.length === 0 ? (
        <div className="border border-dashed border-neutral-300 rounded-md p-8 text-center">
          <Users className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
          {parties.length === 0 ? (
            <>
              <h3 className="text-lg font-medium text-neutral-600 mb-1">No Parties Added</h3>
              <p className="text-neutral-500">Click the 'Add New Party' button to add your first party.</p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-neutral-600 mb-1">No Matching Parties</h3>
              <p className="text-neutral-500">No parties match your search criteria.</p>
            </>
          )}
        </div>
      ) : (
        <div className="border border-neutral-200 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Bank Details</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParties.map((party) => (
                <TableRow key={party.id}>
                  <TableCell className="font-medium">{party.name}</TableCell>
                  <TableCell>{party.mobile}</TableCell>
                  <TableCell>
                    {party.bankName ? (
                      <span className="text-xs">
                        {party.bankName} • {party.accountNumber ? `••••${party.accountNumber.slice(-4)}` : 'N/A'}
                      </span>
                    ) : (
                      <span className="text-xs text-neutral-500">No bank details</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(party)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setPartyToDelete(party.id);
                          setShowDeleteConfirm(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add/Edit Party Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editParty ? 'Edit Party' : 'Add New Party'}</DialogTitle>
            <DialogDescription>
              {editParty ? 'Update the party details below.' : 'Enter the party details below to add them to your ledger.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name" className="text-right">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1" 
                  placeholder="Enter party name" 
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="address" className="text-right">
                  Address
                </Label>
                <Input 
                  id="address" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1" 
                  placeholder="Enter address" 
                />
              </div>
              <div className="col-span-1">
                <Label htmlFor="mobile" className="text-right">
                  Mobile
                </Label>
                <Input 
                  id="mobile" 
                  value={mobile} 
                  onChange={(e) => setMobile(e.target.value)}
                  className="mt-1" 
                  placeholder="Enter mobile number" 
                />
              </div>
              <div className="col-span-1">
                <Label htmlFor="adharNumber" className="text-right">
                  Aadhar Number
                </Label>
                <Input 
                  id="adharNumber" 
                  value={adharNumber} 
                  onChange={(e) => setAdharNumber(e.target.value)}
                  className="mt-1" 
                  placeholder="Enter Aadhar number" 
                />
              </div>
              <div className="col-span-1">
                <Label htmlFor="panNumber" className="text-right">
                  PAN Number
                </Label>
                <Input 
                  id="panNumber" 
                  value={panNumber} 
                  onChange={(e) => setPanNumber(e.target.value)}
                  className="mt-1" 
                  placeholder="Enter PAN number" 
                />
              </div>
              <div className="col-span-1">
                <Label htmlFor="bankName" className="text-right">
                  Bank Name
                </Label>
                <Input 
                  id="bankName" 
                  value={bankName} 
                  onChange={(e) => setBankName(e.target.value)}
                  className="mt-1" 
                  placeholder="Enter bank name" 
                />
              </div>
              <div className="col-span-1">
                <Label htmlFor="accountNumber" className="text-right">
                  Account Number
                </Label>
                <Input 
                  id="accountNumber" 
                  value={accountNumber} 
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="mt-1" 
                  placeholder="Enter account number" 
                />
              </div>
              <div className="col-span-1">
                <Label htmlFor="ifscCode" className="text-right">
                  IFSC Code
                </Label>
                <Input 
                  id="ifscCode" 
                  value={ifscCode} 
                  onChange={(e) => setIfscCode(e.target.value)}
                  className="mt-1" 
                  placeholder="Enter IFSC code" 
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={saveParty}>{editParty ? 'Update Party' : 'Add Party'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this party? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteParty}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
