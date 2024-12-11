import { useEffect } from "react";
import React from "react";
import logoImg from '../../assets/logo.svg';
import { Link, replace, useNavigate } from 'react-router-dom';
import { Container } from '../../components/container';

import { Input } from '../../components/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { auth } from '../../services/firebaseConnection';
import { createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';

const schema = z.object({
  name: z.string().nonempty("O campo nome é obrigatório"),
  email: z.string().email("Insira um email válido").nonempty("O campo email é obrigatório"),
  password: z.string().nonempty("O campo senha é obrigatório").min(6, "A senha deve conter mais de 6 caracteres")
})

type FormData = z.infer<typeof schema>

export function Register() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
      resolver: zodResolver(schema),
      mode: "onChange"
  })

  useEffect(() => {
    async function handleLogout() {
      await signOut(auth);
    }
    handleLogout();
  }, [])

  function onSubmit(data: FormData){
    createUserWithEmailAndPassword(auth, data.email, data.password)
    .then(async (user) => {
        await updateProfile(user.user, {
            displayName: data.name
        })

        console.log("Cadastrado com sucesso!")
        navigate("/dashboard", { replace: true })
    })
    .catch((error) => {
        console.log(error);
    })
  }

  return (
    <Container>
      <div className="w-full min-h-screen flex justify-center items-center flex-col gap-4">
        <Link to="/" className="mb-6 max-w-sm w-full">
          <img
            src={logoImg}
            alt="Logo do site"
            className="w-full"
          />
        </Link>

        <form 
          className="bg-white max-w-xl w-full rounded-lg p-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="mb-3">
            <Input
              type="text"
              placeholder="Digite seu nome completo"
              name="name"
              error={errors.name?.message}
              register={register}
            />
          </div>

          <div className="mb-3">
            <Input
              type="email"
              placeholder="Digite seu email"
              name="email"
              error={errors.email?.message}
              register={register}
            />
          </div>

          <div className="mb-3">
            <Input
              type="password"
              placeholder="Digite sua senha"
              name="password"
              error={errors.password?.message}
              register={register}
            />
          </div>

          <button type="submit" className="w-full h-11 bg-zinc-900 rounded text-white text-lg">
            Acessar
          </button>

        </form>

        <Link className="hover:underline" to={"/login"}>Já possui conta? Faça login</Link>

      </div>
    </Container>
  )
}