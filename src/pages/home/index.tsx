import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"
import { Container } from "../../components/container";

import { db } from "../../services/firebaseConnection";
import { 
    collection,
    query,
    orderBy,
    getDocs
} from "firebase/firestore";

type ImagesProps = {
    name: string;
    uid: string;
    url: string;
}

interface CarroProps {
    id: string;
    name: string;
    price: string;
    year: string;
    km: string;
    city: string;
    description: string;
    images: ImagesProps[];
}

export function Home() {
    const [cars, setCars] = useState<CarroProps[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        function getCars() {
            const carsRef = collection(db, 'cars');
            const queryRef = query(carsRef, orderBy("created", "desc"));

            getDocs(queryRef)
            .then((snapshot) => {
                let list = [] as CarroProps[];

                snapshot.forEach((doc) => {
                    list.push({
                        id: doc.id,
                        name: doc.data().name,
                        price: doc.data().price,
                        year: doc.data().year,
                        km: doc.data().km,
                        city: doc.data().city,
                        description: doc.data().description,
                        images: doc.data().images,
                    })
                })

                setCars(list);
                setIsLoading(false);
            })
        }

        getCars();
    }, [])

    return (
        <Container>
            <section className="bg-white p-4 rounded-lg w-full max-w-3xl mx-auto flex justify-center items-center gap-2">
                <input
                    placeholder="Digite o nome do carro..."
                    className="w-full border-2 rounded-lg h-9 px-3 outline-none"
                />
                <button
                    className="bg-red-500 h-9 px-8 rounded-lg text-white font-medium text-lg"
                >Buscar</button>
            </section>

            <h1 className="font-bold text-center mt-6 text-2xl mb-4">
                Carros novos e usados em todo Brasil
            </h1>

            <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

                {isLoading && (
                    <span>Carregando os carros disponíveis...</span>
                )}
                
                {!isLoading && cars.map((item) => (
                    <Link to={`/car/${item.id}`}>
                        <section key={item.id} className="w-full bg-white rounded-lg">
                            <img
                                className="w-full rounded-lg mb-2 max-h-72 hover:scale-105 transition-all"
                                src={item.images[0].url}
                                alt={item.name}
                            />
                            <p className="font-bold mt-1 mb-2 px-2">{item.name}</p>
                            <div className="flex flex-col px-2">
                                <span className="text-zinc-700 mb-6">Ano {item.year} | {item.km} km</span>
                                <strong className="text-black font-bold text-xl">R$ {item.price}</strong>
                            </div>
                            <div className="w-full h-px  bg-slate-200 my-2"></div>
                            <div className="px-2 pb-2">
                                <span className="text-zinc-700">
                                    {item.city}
                                </span>
                            </div>
                        </section>
                    </Link>
                ))}

            </main>
        </Container>
    )
}