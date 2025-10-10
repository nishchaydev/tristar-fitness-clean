import { useEffect } from 'react'
import { useDataStore } from '@/lib/dataSync'
import { loadSyncedJSON } from '@/lib/utils'

export const useInitializeDemoData = () => {
  const { 
    members, 
    trainers, 
    visitors, 
    invoices, 
    followUps, 
    activities,
    proteins, 
    initializeDemoData,
    importData 
  } = useDataStore()
  
  useEffect(() => {
    // First try to load data from backend
    const loadBackendData = async () => {
      try {
        const [membersData, trainersData, visitorsData, invoicesData, followUpsData, activitiesData, proteinsData] = await Promise.all([
          loadSyncedJSON('members'),
          loadSyncedJSON('trainers'),
          loadSyncedJSON('visitors'),
          loadSyncedJSON('invoices'),
          loadSyncedJSON('followups'),
          loadSyncedJSON('activities'),
          loadSyncedJSON('proteins')
        ]);

        // If we have any data from backend, use it
        if (membersData.length || trainersData.length || visitorsData.length || 
            invoicesData.length || followUpsData.length || activitiesData.length || 
            proteinsData.length) {
          console.log('Loading data from backend...');
          importData(JSON.stringify({
            members: membersData,
            trainers: trainersData,
            visitors: visitorsData,
            invoices: invoicesData,
            followUps: followUpsData,
            activities: activitiesData,
            proteins: proteinsData
          }));
          return true;
        }
        return false;
      } catch (error) {
        console.error('Failed to load backend data:', error);
        return false;
      }
    };

    // Only initialize demo data if both local store is empty and backend has no data
    const checkAndInitialize = async () => {
      if (members && trainers && visitors && invoices && followUps && activities &&
          members.length === 0 && trainers.length === 0 && visitors.length === 0 && 
          invoices.length === 0 && followUps.length === 0 && activities.length === 0) {
        
        const hasBackendData = await loadBackendData();
        if (!hasBackendData) {
          console.log('No backend data found, initializing demo data...');
          initializeDemoData();
        }
      }
    };

    checkAndInitialize();
  }, [members, trainers, visitors, invoices, followUps, activities, proteins, initializeDemoData, importData])
}

