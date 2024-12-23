import { Container } from "../../components/container";
import { DashboardHeader } from "../../components/painelHeader";
import { AuthContext } from "../../context/AuthContent";
import React from "react";
import { useEffect, useState, useContext } from "react";

import { FiTrash2 } from "react-icons/fi";

import { db, storage } from "../../services/firebaseConnection";
import { 
    collection,
    query,
    where,
    getDocs,
    doc,
    deleteDoc
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { ImagesProps } from "../home";
import { Link } from "react-router-dom";

interface CarroProps {
    id: string;
    name: string;
    price: string;
    year: string;
    km: string;
    city: string;
    description: string;
    images: ImagesProps[];
    uid: string;
}

export function Dashboard() {
    const [cars, setCars] = useState<CarroProps[]>([]);
    const [loadImages, setLoadImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const { user } = useContext(AuthContext);

    useEffect(() => {
        function getCars() {
            if(!user?.uid) {
                return;
            }

            const carsRef = collection(db, 'cars');
            const queryRef = query(carsRef, where("uid", "==", user.uid));

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
                        uid: doc.data().uid,
                    })
                })

                setCars(list);
                setIsLoading(false);
            })
        }

        getCars();
    }, [user])

    function handleImageLoad(id: string) {
        setLoadImages((prevImageLoaded) => [...prevImageLoaded, id]);
    }

    async function handleDeleteCar(car: CarroProps) {
        const itemCar = car;

        const docRef = doc(db, "cars", itemCar.id);
        await deleteDoc(docRef);

        itemCar.images.map( async (image) => {
            const imagePath = `images/${image.uid}/${image.name}`;
            const imageRef = ref(storage, imagePath);

            try {
                await deleteObject(imageRef);
                setCars(cars.filter(carFilter => carFilter.id !== itemCar.id));
                alert("Carro removido!");
            } catch (error) {
                console.log(error);
            }
        });
    }

    return (
        <Container>
            <DashboardHeader />

            <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

                {isLoading && (
                    <span>Carregando os seus carros...</span>
                )}

                {!isLoading && cars.map((item) => (
                    
                    <section className="w-full bg-white rounded-lg relative">
                        <button
                            className="absolute bg-white w-12 h-12 rounded-full flex items-center justify-center right-2 top-2 drop-shadow"
                            onClick={() => handleDeleteCar(item)}
                        >
                            <FiTrash2 size={26} color="#000"/>
                        </button>
                        <div
                            className="w-full h-72 rounded-lg bg-slate-200"
                            style={{ display: loadImages.includes(item.id) ? "none" : "block" }}
                        ></div>
                        <img
                            className="w-full rounded-lg mb-2 max-h-72"
                            src={item.images[0].url}
                            alt={item.name}
                            onLoad={ () => handleImageLoad(item.id) }
                            style={{ display: loadImages.includes(item.id) ? "block" : "none" }}
                        />
                        <Link to={`/car/${item.id}`}>
                            <p className="font-bold mt-1 mb-2 px-2">{item.name}</p>
                            <div className="flex flex-col px-2">
                                <span className="text-zinc-700 mb-6">Ano {item.year} | {item.km} km</span>
                                <strong className="text-black font-bold text-xl">R$ {item.price}</strong>
                            </div>
                            <div className="w-full h-px bg-slate-200 my-2"></div>
                            <div className="px-2 pb-2">
                                <span className="text-zinc-700">
                                    {item.city}
                                </span>
                            </div>
                        </Link>
                    </section>
                ))}

            </main>

        </Container>
    )
}