import { ReactNode, useContext } from 'react';
import { AuthContext } from '../context/AuthContent';
import { Navigate } from 'react-router-dom';
import React from 'react';

interface PrivateProps {
    children: ReactNode
}

export function Private({ children }: PrivateProps): any {
    const { signed, loadingAuth } = useContext(AuthContext);

    if(loadingAuth) {
        return <div></div>
    }

    if(!signed) {
        return <Navigate to={"/login"}/>
    }

    return children;
}