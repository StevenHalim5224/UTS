import { createContext, useContext, useEffect, useState } from "react";
import initialData from "../data/dummyData";

const KosContext = createContext();
const STORAGE_KEY = "smartkos_data";

export const KosProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialData;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const [users] = useState(() => {
    const saved = localStorage.getItem('users');
    const storedUsers = saved ? JSON.parse(saved) : [];

    return storedUsers.length > 0
      ? storedUsers
      : [{ username: "Admin", password: "Admin" }];
  });

  const [currentUser, setCurrentUser] = useState(() =>{
    const saved = localStorage.getItem('currentUser')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => { localStorage.setItem('users', JSON.stringify(users));},[users])
  useEffect(() => { localStorage.setItem('currentUser', JSON.stringify(currentUser));},[currentUser])

  const login = (username, password) => {
    const user = users.find(u => u.username === username && u.password === password);
    if(user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  }

  const logout = () => {
    setCurrentUser(null)
  }

  const tambahPenghuni = (penghuniBaru) => {
    const id = `P-${Date.now()}`;
    const payload = {
      ...penghuniBaru,
      id,
      statusAktif: true,
      tanggalKeluar: null,
    };

    setData((prev) => ({
      ...prev,
      penghuni: [...prev.penghuni, payload],
      kamar: prev.kamar.map((k) =>
        k.id === penghuniBaru.kamarId ? { ...k, status: "Terisi" } : k,
      ),
    }));
  };

  const keluarPenghuni = (penghuniId) => {
    setData((prev) => {
      const targetPenghuni = prev.penghuni.find(
        (p) => p.id === penghuniId && p.statusAktif,
      );
      if (!targetPenghuni) return prev;

      return {
        ...prev,
        penghuni: prev.penghuni.map((p) =>
          p.id === penghuniId
            ? {
                ...p,
                statusAktif: false,
                tanggalKeluar: new Date().toISOString().split("T")[0],
              }
            : p,
        ),
        kamar: prev.kamar.map((k) =>
          k.id === targetPenghuni.kamarId ? { ...k, status: "Kosong" } : k,
        ),
      };
    });
  };

  const hapusDataPenghuniLama = (id) => {
    setData((prev) => ({
      ...prev,
      penghuni: prev.penghuni.filter((p) => p.id !== id),
    }));
  };


  const resetData = () => {
    if (
      window.confirm(
        "Kembalikan seluruh data ke kondisi awal? Data lokal saat ini akan hilang.",
      )
    ) {
      setData(initialData);
    }
  };

  const tambahTransaksi = (transaksiBaru) => {
    const id = `TR-${Date.now()}`;
    const payload = {
      ...transaksiBaru,
      id,
      tanggal: new Date().toISOString().split("T")[0], //set otomatis hari ini
    };

    setData((prev) => ({
      ...prev,
      transaksi: [payload, ...prev.transaksi],
    }));
  };

  const ubahStatusKeluhan = (id) => {
    setData((prev) => ({
      ...prev,
      keluhan: prev.keluhan.map((k) => {
        if (k.id === id) {
          const nextStatus =
            k.status === "Pending"
              ? "Proses"
              : k.status === "Proses"
                ? "Selesai"
                : "Pending";
          return { ...k, status: nextStatus };
        }
        return k;
      }),
    }));
  };

  const tambahKeluhan = (keluhanBaru) => {
    const id = `KL-${Date.now()}`;
    const payload = {
      ...keluhanBaru,
      id,
      status: "Pending",
      tanggal: new Date().toISOString().split("T")[0],
    };

    setData((prev) => ({
      ...prev,
      keluhan: [payload, ...prev.keluhan],
    }));
  };

  const hapusKeluhan = (id) => {
    setData((prev) => ({
      ...prev,
      keluhan: prev.keluhan.filter((k) => k.id !== id),
    }));
  };

  const tambahKamar = (kamarBaru) => {
      const id = `KMR-${Date.now()}`;
      setData((prev) => ({
        ...prev,
        kamar: [...prev.kamar, {...kamarBaru, id, status: "Kosong"}]
      }))
  }

  const editKamar = (id, dataUpdate) => {
      setData((prev) => ({
        ...prev,
        kamar: prev.kamar.map((k) => k.id === id ? {...k, ...dataUpdate} : k)
      }))
  }

  const hapusKamar = (id) => {
      setData((prev) => ({
        ...prev,
        kamar: prev.kamar.filter((k) => k.id !== id)
      }))
  }

  return (
    <KosContext.Provider
      value={{
        kamar: data.kamar,
        penghuni: data.penghuni,
        tagihan: data.tagihan,
        transaksi: data.transaksi,
        keluhan: data.keluhan,

        currentUser,
        login,
        logout,
        
        tambahPenghuni,
        keluarPenghuni,
        hapusDataPenghuniLama,

        resetData,
        tambahTransaksi,
        ubahStatusKeluhan,
        tambahKeluhan,
        hapusKeluhan, 
        tambahKamar,
        editKamar,
        hapusKamar,
      }}
    >
      {children}
    </KosContext.Provider>
  );
};

export const useKos = () => {
  const context = useContext(KosContext);
  if (!context) {
    throw new Error("useKos harus digunakan didalam KosProvider");
  }
  return context;
};
export default KosProvider;
