import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Reply from "./components/Reply";
import Tweet from "./components/Tweet";

const theme = createTheme({
  typography: {
    fontFamily: "'Quicksand', sans-serif",
    h3: {
      fontWeight: "bold",
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reply" element={<Reply />} />
          <Route path="/tweet" element={<Tweet />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
