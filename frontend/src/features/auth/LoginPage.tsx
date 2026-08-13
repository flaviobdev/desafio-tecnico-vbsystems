import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ErrorBanner } from '../../components/ErrorBanner';
import { ApiError } from '../../lib/api-client';
import {
  cleanDocument,
  isValidDocumentValue,
  maskDocument,
} from '../../lib/document';
import { useAuth } from './AuthContext';
import './login.css';

const schema = z.object({
  document: z
    .string()
    .min(1, 'Informe o CPF ou CNPJ.')
    .refine(isValidDocumentValue, 'CPF ou CNPJ inválido.')
    .transform(cleanDocument),
  password: z.string().min(1, 'Informe a senha.'),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const documentField = register('document');

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      await login(values);
      navigate('/', { replace: true });
    } catch (err) {
      setServerError(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível entrar. Tente novamente.',
      );
    }
  }

  return (
    <div className="login-screen">
      <Card className="login-card">
        <p className="login-eyebrow">VBA · BaaS</p>
        <h1>Entrar no painel</h1>
        <p className="login-sub">
          Acompanhe seu saldo, receba pagamentos e solicite saques.
        </p>

        {serverError && <ErrorBanner message={serverError} />}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="ui-field">
            <label htmlFor="document">CPF ou CNPJ</label>
            <input
              id="document"
              autoComplete="username"
              {...documentField}
              onChange={(e) => {
                e.target.value = maskDocument(e.target.value);
                void documentField.onChange(e);
              }}
            />
            {errors.document && (
              <span className="ui-field-error">{errors.document.message}</span>
            )}
          </div>

          <div className="ui-field">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
            />
            {errors.password && (
              <span className="ui-field-error">{errors.password.message}</span>
            )}
          </div>

          <Button
            type="submit"
            loading={isSubmitting}
            style={{ width: '100%' }}
          >
            Entrar
          </Button>
        </form>

        <p
          className="login-sub"
          style={{ marginTop: 'var(--space-4)', marginBottom: 0 }}
        >
          <Link to="/esqueci-senha">Esqueci minha senha</Link>
        </p>
      </Card>
    </div>
  );
}
