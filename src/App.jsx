import React, { useMemo, useState } from "react";
import {
  Calculator,
  RotateCcw,
  Package,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import CITIES from "./data/cities.json";

const MOSCOW = {
  lat: 55.7558,
  lon: 37.6173,
};

const initialForm = {
  weight: "",
  length: "",
  width: "",
  height: "",
  city: "",
  basePrice: "",
};

function toNumber(value) {
  return Number(String(value).replace(",", "."));
}

function formatMoney(value) {
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function getDistanceFromMoscow(city) {
  const earthRadiusKm = 6371;

  const cityLat = Number(city.coords.lat);
  const cityLon = Number(city.coords.lon);

  const dLat = toRadians(cityLat - MOSCOW.lat);
  const dLon = toRadians(cityLon - MOSCOW.lon);

  const lat1 = toRadians(MOSCOW.lat);
  const lat2 = toRadians(cityLat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(earthRadiusKm * c);
}

function getMarkupByDistance(distance) {
  if (distance <= 500) return 20;
  if (distance <= 1500) return 25;
  return 30;
}

export default function ParcelPriceCalculator() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const selectedCity = useMemo(
    () => CITIES.find((city) => city.name === form.city),
    [form.city],
  );

  const selectedDistance = useMemo(() => {
    if (!selectedCity) return 0;
    return getDistanceFromMoscow(selectedCity);
  }, [selectedCity]);

  const errors = useMemo(() => {
    const result = {};

    const numericFields = [
      ["weight", "Введите вес посылки"],
      ["length", "Введите длину"],
      ["width", "Введите ширину"],
      ["height", "Введите высоту"],
      ["basePrice", "Введите базовую стоимость"],
    ];

    numericFields.forEach(([field, message]) => {
      const value = toNumber(form[field]);

      if (!form[field]) result[field] = message;
      else if (!Number.isFinite(value) || value <= 0)
        result[field] = "Значение должно быть больше 0";
    });

    if (!form.city) result.city = "Выберите город доставки";

    return result;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  const calculation = useMemo(() => {
    if (!selectedCity) return null;

    const basePrice = toNumber(form.basePrice);

    const markupPercent = getMarkupByDistance(selectedDistance);

    const markupAmount = basePrice * (markupPercent / 100);

    const totalPrice = basePrice + markupAmount;

    return {
      markupPercent,
      markupAmount,
      totalPrice,
      distance: selectedDistance,
    };
  }, [form.basePrice, selectedCity, selectedDistance]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCalculate = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  const handleClear = () => {
    setForm(initialForm);
    setSubmitted(false);
  };

  const showResult = submitted && isValid && calculation;

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-100 to-white p-6 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-3xl bg-white p-8 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-violet-500">
                
              </p>

              <h1 className="mt-2 text-4xl font-bold">
                Калькулятор стоимости доставки
              </h1>

              <p className="mt-3 text-slate-600">
                Автоматический расчёт стоимости отправки с наценкой по
                удалённости от Москвы.
              </p>
            </div>

            <div className="rounded-3xl bg-violet-100 p-5">
              <Package className="h-10 w-10 text-violet-700" />
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.form
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleCalculate}
            className="rounded-3xl bg-white p-8 shadow-xl"
          >
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-semibold">
              <Calculator className="h-6 w-6 text-violet-600" />
              Данные посылки
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <InputField
                label="Вес, кг"
                name="weight"
                value={form.weight}
                onChange={handleChange}
                error={submitted && errors.weight}
              />

              <InputField
                label="Длина, см"
                name="length"
                value={form.length}
                onChange={handleChange}
                error={submitted && errors.length}
              />

              <InputField
                label="Ширина, см"
                name="width"
                value={form.width}
                onChange={handleChange}
                error={submitted && errors.width}
              />

              <InputField
                label="Высота, см"
                name="height"
                value={form.height}
                onChange={handleChange}
                error={submitted && errors.height}
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Город доставки
                </label>

                <select
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                >
                  <option value="">Выберите город</option>

                  {CITIES.map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>

                {submitted && errors.city && <ErrorText text={errors.city} />}
              </div>

              <InputField
                label="Базовая стоимость"
                name="basePrice"
                value={form.basePrice}
                onChange={handleChange}
                error={submitted && errors.basePrice}
              />
            </div>

            <div className="mt-8 flex gap-4">
              <button
                type="submit"
                className="rounded-2xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-700"
              >
                Рассчитать
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-2 rounded-2xl border border-slate-200 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <RotateCcw className="h-4 w-4" />
                Очистить
              </button>
            </div>
          </motion.form>

          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-white p-8 shadow-xl"
          >
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-semibold">
              <MapPin className="h-6 w-6 text-violet-600" />
              Результат
            </h2>

            {!submitted && (
              <div className="rounded-2xl bg-slate-50 p-5 text-slate-600">
                Заполните форму и нажмите «Рассчитать».
              </div>
            )}

            {submitted && !isValid && (
              <div className="rounded-2xl bg-red-50 p-5 text-red-700">
                Проверьте корректность заполнения формы.
              </div>
            )}

            {showResult && (
              <div className="space-y-4">
                <ResultRow
                  label="Удалённость от Москвы"
                  value={`${calculation.distance} км`}
                />

                <ResultRow
                  label="Процент наценки"
                  value={`${calculation.markupPercent}%`}
                />

                <ResultRow
                  label="Сумма наценки"
                  value={`${formatMoney(calculation.markupAmount)} ₽`}
                />

                <div className="rounded-3xl bg-violet-600 p-6 text-white">
                  <p className="text-sm text-violet-100">Итоговая стоимость</p>

                  <p className="mt-2 text-4xl font-bold">
                    {formatMoney(calculation.totalPrice)} ₽
                  </p>
                </div>
              </div>
            )}
          </motion.section>
        </div>
      </div>
    </main>
  );
}

function InputField({ label, name, value, onChange, error }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type="number"
        min="0"
        step="0.01"
        name={name}
        value={value}
        onChange={onChange}
        placeholder="Введите значение"
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
      />

      {error && <ErrorText text={error} />}
    </div>
  );
}

function ErrorText({ text }) {
  return (
    <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
      <AlertCircle className="h-4 w-4" />
      {text}
    </p>
  );
}

function ResultRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
      <span className="text-slate-600">{label}</span>

      <span className="font-semibold">{value}</span>
    </div>
  );
}
