import { createContext, useContext, useState, useEffect } from 'react'

const RouterContext = createContext()

export function Router({ children }) {
  const [location, setLocation] = useState(window.location.pathname)
  const [search, setSearch] = useState(window.location.search)

  useEffect(() => {
    const handlePopState = () => {
      setLocation(window.location.pathname)
      setSearch(window.location.search)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = (to) => {
    window.history.pushState({}, '', to)
    setLocation(to)
    setSearch(window.location.search)
  }

  return (
    <RouterContext.Provider value={{ location, search, navigate }}>
      {children}
    </RouterContext.Provider>
  )
}

export function useLocation() {
  return useContext(RouterContext).location
}

export function useSearch() {
  return useContext(RouterContext).search
}

export function useNavigate() {
  return useContext(RouterContext).navigate
}

export function Link({ to, children, className, ...props }) {
  const navigate = useNavigate()
  
  const handleClick = (e) => {
    if (e.ctrlKey || e.metaKey || e.shiftKey) return
    e.preventDefault()
    navigate(to)
  }
  
  return (
    <a href={to} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  )
}
