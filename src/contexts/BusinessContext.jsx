import { createContext, useContext } from 'react';

const BusinessContext = createContext(null);

export function BusinessProvider({ business, children }) {
  return (
    <BusinessContext.Provider value={business}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  return useContext(BusinessContext);
}
