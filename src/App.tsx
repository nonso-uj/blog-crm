import { BrowserRouter, Route, Routes } from 'react-router'
import Dashboard from './pages/Dashboard'
import Login from './pages/Auth/Login'
import { useAppSelector } from './redux/hooks'
import { AppLinks } from './utils/Routes'
import Settings from './pages/Settings'
import BlogPostPage from './pages/BlogPostPage'
import NewPostPage from './pages/NewPostPage'

function App() {
  const isLoggedIn = useAppSelector((state) => !!state.user.user);

  return (
   <BrowserRouter>
    <Routes>
      <Route index element={isLoggedIn ? <Dashboard /> : <Login />} />

      {isLoggedIn && (
        <>
          <Route index element={<Dashboard />} />
          <Route path={AppLinks.newPost} element={<NewPostPage />} />
          <Route path={AppLinks.postPage} element={<BlogPostPage />} />
          <Route path={AppLinks.settings} element={<Settings />} />
        </>
      )}
    </Routes>
   </BrowserRouter>
  )
}

export default App