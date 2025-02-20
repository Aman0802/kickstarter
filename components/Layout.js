import Head from "next/head";
import { Container } from "semantic-ui-react";
import Header from "./Header";

const Layout = ({ children }) => {
  return (
    <>
      <Container>
        <Head>
          <link
            async
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/semantic-ui@2/dist/semantic.min.css"
          />
        </Head>
        <Header />
        {children}
      </Container>
    </>
  );
};

export default Layout;
