import { useEffect } from 'react'
import { useDataStore } from '@/lib/dataSync'

export const useInitializeDemoData = () => {
  const { 
    members, 
    trainers, 
    visitors, 
    invoices, 
    followUps, 
    activities, 
    initializeDemoData 
  } = useDataStore()
  
  useEffect(() => {
    // Check if store is empty and initialize demo data
    if (members.length === 0 && trainers.length === 0 && visitors.length === 0 && 
        invoices.length === 0 && followUps.length === 0 && activities.length === 0) {
      console.log('Store is empty, initializing demo data...')
      initializeDemoData()
    }
  }, [members.length, trainers.length, visitors.length, invoices.length, followUps.length, activities.length, initializeDemoData])
}
