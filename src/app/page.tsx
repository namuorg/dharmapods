'use client';

import { useState } from 'react';
import Papa from 'papaparse';

interface Attendee {
  name: string;
  age: number;
  gender: string;
  bipoc: boolean;
  lgbtqia: boolean;
  experienceDays: number;
}

interface Group {
  id: number;
  members: Attendee[];
  demographics: {
    avgAge: number;
    genderDistribution: Record<string, number>;
    bipocCount: number;
    lgbtqiaCount: number;
    avgExperience: number;
  };
}

function parseCSV(csvText: string): Attendee[] {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim()
  });
  
  return result.data.map(row => ({
    name: row.name?.trim() || '',
    age: parseInt(row.age) || 0,
    gender: row.gender?.trim() || '',
    bipoc: row.bipoc?.toLowerCase() === 'true' || row.bipoc?.toLowerCase() === 'yes',
    lgbtqia: row.lgbtqia?.toLowerCase() === 'true' || row.lgbtqia?.toLowerCase() === 'yes',
    experienceDays: parseInt(row.experienceDays) || 0
  }));
}

function calculateGroupDemographics(members: Attendee[]) {
  const avgAge = members.reduce((sum, m) => sum + m.age, 0) / members.length;
  const genderDistribution = members.reduce((acc, m) => {
    acc[m.gender] = (acc[m.gender] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const bipocCount = members.filter(m => m.bipoc).length;
  const lgbtqiaCount = members.filter(m => m.lgbtqia).length;
  const avgExperience = members.reduce((sum, m) => sum + m.experienceDays, 0) / members.length;
  
  return {
    avgAge: Math.round(avgAge),
    genderDistribution,
    bipocCount,
    lgbtqiaCount,
    avgExperience: Math.round(avgExperience)
  };
}

function distributeIntoGroups(attendees: Attendee[], groupSize: number = 8): Group[] {
  const groups: Group[] = [];
  const remaining = [...attendees];
  
  while (remaining.length > 0) {
    const group: Attendee[] = [];
    const currentGroupSize = Math.min(groupSize, remaining.length);
    
    for (let i = 0; i < currentGroupSize; i++) {
      if (remaining.length === 0) break;
      
      let selectedIndex = 0;
      
      if (group.length > 0) {
        const bipocInGroup = group.filter(m => m.bipoc).length;
        const lgbtqiaInGroup = group.filter(m => m.lgbtqia).length;
        
        const bipocCandidates = remaining.filter(m => m.bipoc);
        const lgbtqiaCandidates = remaining.filter(m => m.lgbtqia);
        
        if (bipocInGroup === 1 && bipocCandidates.length > 0) {
          selectedIndex = remaining.findIndex(m => m.bipoc);
        } else if (lgbtqiaInGroup === 1 && lgbtqiaCandidates.length > 0) {
          selectedIndex = remaining.findIndex(m => m.lgbtqia);
        } else {
          selectedIndex = Math.floor(Math.random() * remaining.length);
        }
      } else {
        selectedIndex = Math.floor(Math.random() * remaining.length);
      }
      
      group.push(remaining.splice(selectedIndex, 1)[0]);
    }
    
    groups.push({
      id: groups.length + 1,
      members: group,
      demographics: calculateGroupDemographics(group)
    });
  }
  
  return groups;
}

export default function Home() {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupSize, setGroupSize] = useState(8);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvText = e.target?.result as string;
        const parsedAttendees = parseCSV(csvText);
        setAttendees(parsedAttendees);
      };
      reader.readAsText(file);
    }
  };

  const handleDistributeGroups = () => {
    if (attendees.length > 0) {
      const distributedGroups = distributeIntoGroups(attendees, groupSize);
      setGroups(distributedGroups);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Retreat Group Distribution</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Upload Attendees CSV</h2>
          <p className="text-gray-600 mb-4">
            CSV should have columns: name, age, gender, bipoc, lgbtqia, experienceDays
          </p>
          <div className="flex gap-4 items-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <div className="flex items-center gap-2">
              <label htmlFor="groupSize" className="text-sm font-medium text-gray-700">
                Group Size:
              </label>
              <input
                id="groupSize"
                type="number"
                min="3"
                max="12"
                value={groupSize}
                onChange={(e) => setGroupSize(parseInt(e.target.value))}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
          {attendees.length > 0 && (
            <div className="mt-4">
              <p className="text-green-600 font-medium">{attendees.length} attendees loaded</p>
              <button
                onClick={handleDistributeGroups}
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Distribute into Groups
              </button>
            </div>
          )}
        </div>

        {groups.length > 0 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Distribution Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="font-medium text-gray-700">Total Groups</h3>
                  <p className="text-2xl font-bold text-blue-600">{groups.length}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="font-medium text-gray-700">Total Attendees</h3>
                  <p className="text-2xl font-bold text-green-600">{attendees.length}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="font-medium text-gray-700">Avg Group Size</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.round(attendees.length / groups.length)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {groups.map((group) => (
                <div key={group.id} className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Group {group.id}</h3>
                  
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Members ({group.members.length})</h4>
                    <div className="space-y-1">
                      {group.members.map((member, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          {member.name} ({member.age}, {member.gender})
                          {member.bipoc && <span className="ml-2 text-blue-600">BIPOC</span>}
                          {member.lgbtqia && <span className="ml-2 text-purple-600">LGBTQIA</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-700 mb-2">Demographics</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Avg Age:</span> {group.demographics.avgAge}
                      </div>
                      <div>
                        <span className="text-gray-600">Avg Experience:</span> {group.demographics.avgExperience} days
                      </div>
                      <div>
                        <span className="text-gray-600">BIPOC:</span> {group.demographics.bipocCount}
                      </div>
                      <div>
                        <span className="text-gray-600">LGBTQIA:</span> {group.demographics.lgbtqiaCount}
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-gray-600 text-sm">Gender Distribution:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(group.demographics.genderDistribution).map(([gender, count]) => (
                          <span key={gender} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {gender}: {count}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
