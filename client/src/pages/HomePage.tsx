import { useAuthStore } from "../store/useAuthStore";

const HomePage = () => {
  const {logout} = useAuthStore();
  return (
    <div>
      HomePage
<button onClick={logout}>Logout</button>
    </div>
  )
}

export default HomePage