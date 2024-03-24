import React, { useEffect } from "react";
import axios from "axios";
import "./App.css";

export default function App() {
  useEffect(() => {
    axios
      .get(
        "https://caa84c5d-f25b-48a7-b657-893f7e430025-00-24lluiepd75yx.spock.replit.dev:8080/v1/getinfo",
        {
          headers: {
            "Grpc-Metadata-macaroon":
              "0201036c6e640269030a1045d5eaa0d5f646ce4d596d3dfcd070121201301a0c0a04696e666f1204726561641a100a08696e766f696365731204726561641a100a086f6666636861696e1204726561641a0f0a076f6e636861696e1204726561641a0e0a067369676e657212047265616400000620c3693fb057ce434939aa155abb635ed0feeff32b853e65a171427ac16d39b522",
          },
        },
      )
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  return <main>React ⚛️ + Vite ⚡ + Replit</main>;
}
