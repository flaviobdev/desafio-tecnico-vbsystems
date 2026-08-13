import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ErrorBanner } from '../../components/ErrorBanner';
import { SuccessBanner } from '../../components/SuccessBanner';
import { ApiError } from '../../lib/api-client';
import {
  cleanDocument,
  isValidDocumentValue,
  maskDocument,
} from '../../lib/document';
import { signup } from './api';
import './signup.css';
import '../auth/login.css';

const schema = z.object({
  personType: z.enum(['PF', 'PJ']),
  name: z.string().min(1, 'Informe o nome ou razão social.'),
  tradingName: z.string().optional(),
  email: z.string().min(1, 'Informe o e-mail.').email('E-mail inválido.'),
  phone: z.string().min(1, 'Informe o telefone.'),
  document: z
    .string()
    .min(1, 'Informe o CPF ou CNPJ.')
    .refine(isValidDocumentValue, 'CPF ou CNPJ inválido.')
    .transform(cleanDocument),
  zipCode: z.string().min(1, 'Informe o CEP.'),
  address: z.string().min(1, 'Informe o endereço.'),
  number: z.string().min(1, 'Informe o número.'),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, 'Informe o bairro.'),
  city: z.string().min(1, 'Informe a cidade.'),
  state: z.string().min(1, 'Informe o estado.'),
});

type FormValues = z.infer<typeof schema>;

export function SignupPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { personType: 'PF' },
  });
  const documentField = register('document');

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      await signup(values);
      setDone(true);
    } catch (err) {
      setServerError(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível concluir o cadastro. Tente novamente.',
      );
    }
  }

  return (
    <div className="login-screen">
      <Card className="login-card signup-card">
        <p className="login-eyebrow">VBA · BaaS</p>
        <h1>Criar conta</h1>
        <p className="login-sub">
          Cadastro público no gateway — use e-mail e telefone reais.
        </p>

        {done ? (
          <>
            <SuccessBanner message="Cadastro realizado! Documento, senha, CodigoCliente e ChaveLoja foram enviados pro seu e-mail." />
            <Link to="/login">&larr; Ir para o login</Link>
          </>
        ) : (
          <>
            {serverError && <ErrorBanner message={serverError} />}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="ui-field">
                <label htmlFor="personType">Tipo</label>
                <select id="personType" {...register('personType')}>
                  <option value="PF">Pessoa física</option>
                  <option value="PJ">Pessoa jurídica</option>
                </select>
              </div>

              <div className="ui-field">
                <label htmlFor="name">Nome ou razão social</label>
                <input id="name" {...register('name')} />
                {errors.name && (
                  <span className="ui-field-error">{errors.name.message}</span>
                )}
              </div>

              <div className="ui-field">
                <label htmlFor="tradingName">Nome fantasia (opcional)</label>
                <input id="tradingName" {...register('tradingName')} />
              </div>

              <div className="ui-field">
                <label htmlFor="document">CPF ou CNPJ</label>
                <input
                  id="document"
                  {...documentField}
                  onChange={(e) => {
                    e.target.value = maskDocument(e.target.value);
                    void documentField.onChange(e);
                  }}
                />
                {errors.document && (
                  <span className="ui-field-error">
                    {errors.document.message}
                  </span>
                )}
              </div>

              <div className="ui-field">
                <label htmlFor="email">E-mail</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                />
                {errors.email && (
                  <span className="ui-field-error">{errors.email.message}</span>
                )}
              </div>

              <div className="ui-field">
                <label htmlFor="phone">Telefone</label>
                <input id="phone" autoComplete="tel" {...register('phone')} />
                {errors.phone && (
                  <span className="ui-field-error">{errors.phone.message}</span>
                )}
              </div>

              <div className="signup-row">
                <div className="ui-field">
                  <label htmlFor="zipCode">CEP</label>
                  <input id="zipCode" {...register('zipCode')} />
                  {errors.zipCode && (
                    <span className="ui-field-error">
                      {errors.zipCode.message}
                    </span>
                  )}
                </div>
                <div className="ui-field">
                  <label htmlFor="number">Número</label>
                  <input id="number" {...register('number')} />
                  {errors.number && (
                    <span className="ui-field-error">
                      {errors.number.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="ui-field">
                <label htmlFor="address">Endereço</label>
                <input id="address" {...register('address')} />
                {errors.address && (
                  <span className="ui-field-error">
                    {errors.address.message}
                  </span>
                )}
              </div>

              <div className="ui-field">
                <label htmlFor="complement">Complemento (opcional)</label>
                <input id="complement" {...register('complement')} />
              </div>

              <div className="ui-field">
                <label htmlFor="neighborhood">Bairro</label>
                <input id="neighborhood" {...register('neighborhood')} />
                {errors.neighborhood && (
                  <span className="ui-field-error">
                    {errors.neighborhood.message}
                  </span>
                )}
              </div>

              <div className="signup-row">
                <div className="ui-field">
                  <label htmlFor="city">Cidade</label>
                  <input id="city" {...register('city')} />
                  {errors.city && (
                    <span className="ui-field-error">
                      {errors.city.message}
                    </span>
                  )}
                </div>
                <div className="ui-field">
                  <label htmlFor="state">UF</label>
                  <input id="state" maxLength={2} {...register('state')} />
                  {errors.state && (
                    <span className="ui-field-error">
                      {errors.state.message}
                    </span>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                loading={isSubmitting}
                style={{ width: '100%' }}
              >
                Criar conta
              </Button>
            </form>

            <p
              className="login-sub"
              style={{ marginTop: 'var(--space-4)', marginBottom: 0 }}
            >
              <Link to="/login">&larr; Já tenho conta</Link>
            </p>
          </>
        )}
      </Card>
    </div>
  );
}
