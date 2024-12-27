import React, { ChangeEvent, useState, useContext } from "react";
import { Container } from "../../../components/container";
import { DashboardHeader } from "../../../components/painelHeader";

import { FiUpload, FiTrash } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { v4 as uuidV4 } from "uuid";
import { useForm } from "react-hook-form";
import { Input } from "../../../components/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { AuthContext } from "../../../context/AuthContent";


import { storage, db } from "../../../services/firebaseConnection";
import { 
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
 } from "firebase/storage";
 import { addDoc, collection } from 'firebase/firestore';

import toast from "react-hot-toast";

const schema = z.object({
    name: z.string().nonempty("O campo nome é obrigatório"),
    model: z.string().nonempty("O modelo é obrigatório"),
    year: z.string().nonempty("O ano do carro é obrigatório"),
    km: z.string().nonempty("O KM do carro é obrigatório"),
    price: z.string().nonempty("O preço do carro é obrigatório"),
    city: z.string().nonempty("A cidade é obrigatória"),
    whatsapp: z.string().min(1, "O telefone é obrigatório").refine((value) => /^(\d{11,12})$/.test(value), {
        message:"Número de telefone inválido"
    }),
    description: z.string().nonempty("A descrição é obrigatória"),
})

type FormData = z.infer<typeof schema>;

interface ImageItemProps {
    uid: string;
    name: string;
    previewUrl: string;
    url: string;
}

export function New() {
    const { user } = useContext(AuthContext);
    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode:"onChange"
    })

    const [carImages, setCarImages] = useState<ImageItemProps[]>([]);
    const navigate = useNavigate();

    function onSubmit(data: FormData) {
        if(carImages.length === 0) {
            alert("Envie alguma imagem deste carro");
            return;
        }

        const carListImages = carImages.map((car) => {
            return {
                uid: car.uid,
                name: car.name,
                url: car.url
            }
        })

        addDoc(collection(db, "cars"), {
            name: data.name.toUpperCase(),
            model: data.model,
            whatsapp: data.whatsapp,
            city: data.city,
            year: data.year,
            km: data.km,
            price: data.price,
            description: data.description,
            created: new Date(),
            owner: user?.name,
            uid: user?.uid,
            images: carListImages,
        })
        .then(() => {
            reset();
            setCarImages([]);
            toast.success("Carro cadastrado com sucesso!");
            navigate("/dashboard");
        })
        .catch((error) => {
            toast.error("Erro ao cadastrar carro");
        })

    }

    async function handleDeleteImage(item: ImageItemProps) {
        const imagePath = `images/${item.uid}/${item.name}`;

        const imageRef = ref(storage, imagePath);

        try {
            await deleteObject(imageRef);
            setCarImages(carImages.filter((car) => car.url !== item.url));
            toast.error("Imagem deletada!");
        } catch (error) {
            console.log("Erro ao deletar: ", error);
        }
    }
    
    async function handleFile(e: ChangeEvent<HTMLInputElement>) {
        if(e.target.files && e.target.files[0]) {
            const image = e.target.files[0];

            if(image.type === 'image/jpeg' || image.type === 'image|png') {
                await handleUpload(image);
            } else {
                alert("Envie uma imagem JPEG ou PNG");
                return;
            }
        }
    }

    async function handleUpload(image: File) {
        if(!user?.uid) {
            return;
        }

        const currentUid = user?.uid;
        const uidImage = uuidV4();

        const uploadRef = ref(storage, `images/${currentUid}/${uidImage}`);

        uploadBytes(uploadRef, image)
        .then((snapshot) => {
            getDownloadURL(snapshot.ref).then((downloadUrl) => {
                const imageItem = {
                    name: uidImage,
                    uid: currentUid,
                    previewUrl: URL.createObjectURL(image),
                    url: downloadUrl,
                }

                setCarImages((images) => [...images, imageItem]);
                toast.success("Imagem registrada!");
            })
        })

    }

    return (
        <Container>
            <DashboardHeader />

            <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2">
                <button className="border-2 w-48 rounded-lg flex items-center justify-center hover:cursor-pointer border-gray-600 h-32 md:w-48">
                    <div className="absolute cursor-pointer">
                        <FiUpload size={30} color="#000"/>
                    </div>
                    <div className="cursor-pointer">
                        <input
                            type="file"
                            accept="image/*"
                            className="opacity-0 cursor-pointer"
                            onChange={handleFile}
                        />
                    </div>
                </button>

                {carImages.map((item) => (
                    <div key={item.name} className="w-full h-32 flex items-center justify-center relative">
                        <button className="absolute" onClick={() => handleDeleteImage(item)}>
                            <FiTrash size={28} color="#FFF"/>
                        </button>
                        <img
                            src={item.previewUrl}
                            alt="Foto do carro"
                            className="rounded-lg w-full h-32 object-cover"
                        />
                    </div>
                ))}
            </div>

            <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2 mt-2">
                <form
                    className="w-full"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <div className="mb-3">
                        <p className="mb-2 font-medium">Nome do carro</p>
                        <Input
                            type="text"
                            register={register}
                            name="name"
                            error={errors.name?.message}
                            placeholder="Ex: Onix 1.0"
                        />
                    </div>

                    <div className="mb-3">
                        <p className="mb-2 font-medium">Modelo do carro</p>
                        <Input
                            type="text"
                            register={register}
                            name="model"
                            error={errors.model?.message}
                            placeholder="Ex: 1.0 flex plus manual"
                        />
                    </div>

                    <div className="w-full mb-3 flex items-center gap-4">

                        <div className="w-full">
                            <p className="mb-2 font-medium">Ano</p>
                            <Input
                                type="text"
                                register={register}
                                name="year"
                                error={errors.year?.message}
                                placeholder="Ex: 2016/2017"
                            />
                        </div>
                        
                        <div className="w-full">
                            <p className="mb-2 font-medium">Km rodados</p>
                            <Input
                                type="text"
                                register={register}
                                name="km"
                                error={errors.km?.message}
                                placeholder="Ex: 23.070 Km"
                            />
                        </div>

                    </div>

                    <div className="mb-3">
                        <p className="mb-2 font-medium">Telefone | Whatsapp</p>
                        <Input
                            type="text"
                            register={register}
                            name="whatsapp"
                            error={errors.whatsapp?.message}
                            placeholder="Ex: 011988997766"
                        />
                    </div>

                    <div className="mb-3">
                        <p className="mb-2 font-medium">Cidade</p>
                        <Input
                            type="text"
                            register={register}
                            name="city"
                            error={errors.city?.message}
                            placeholder="Ex: São Paulo  - SP"
                        />
                    </div>

                    <div className="mb-3">
                        <p className="mb-2 font-medium">Preço</p>
                        <Input
                            type="text"
                            register={register}
                            name="price"
                            error={errors.price?.message}
                            placeholder="Ex: R$ 68.090"
                        />
                    </div>

                    <div className="mb-3">
                        <p className="mb-2 font-medium">Descrição</p>
                        <textarea
                            className="border-2 w-full rounded-md h-24 px-2"
                            {...register("description")}
                            name="description"
                            id="description"
                            placeholder="Fale de uma forma completa sobre o carro..."
                        >
                            {errors.description && <p className="mb-1 text-red-500">{errors.description.message}</p>}
                        </textarea>
                    </div>

                    <button type="submit" className="rounded-md bg-zinc-900 text-white font-medium w-full py-2">Cadastrar</button>
                </form>
            </div>
        </Container>
    )
}   