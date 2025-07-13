// app/page.tsx
'use client'; // Necessário para usar recursos do lado do cliente como useEffect e useState

import { useEffect } from 'react';
import Script from 'next/script'; // Para carregar bibliotecas externas (MathJax, Marked)
import { marked } from 'marked'; // Se você instalou 'marked' via npm install marked
// Se você não instalou 'marked', você pode usar a versão carregada pelo Script, 
// mas é mais robusto usar a versão instalada.

declare global {
  // Define o tipo para a variável global MathJax, para o TypeScript não reclamar.
  interface Window {
    MathJax: {
      typesetPromise: (elements?: HTMLElement[] | null) => Promise<void>;
    };
  }
}

export default function Home() {

    useEffect(() => {
        // Esta lógica JavaScript agora roda no lado do cliente (navegador).
        
        // Inicialização do MathJax após a montagem do componente
        const initializeMathJax = () => {
            if (window.MathJax) {
                console.log("MathJax carregado e pronto para renderizar!");
                // Usa typesetPromise para renderizar equações LaTeX no carregamento da página
                window.MathJax.typesetPromise(); 
            } else {
                console.log("MathJax não foi carregado.");
            }
        };

        // Usa setTimeout para garantir que o MathJax esteja carregado (pode ser necessário dependendo do CDN)
        setTimeout(initializeMathJax, 500); 

        const buttons = document.querySelectorAll('.generate-example-btn');

        buttons.forEach(button => {
            button.addEventListener('click', async () => {
                const theoremType = (button as HTMLElement).dataset.theorem;
                const parentSection = button.closest('section');
                if (!parentSection) {
                    console.error('Parent section not found for button:', button);
                    return;
                }
                const llmResponseDiv = parentSection.querySelector('.llm-response') as HTMLElement;
                const loadingIndicator = parentSection.querySelector('.loading-indicator') as HTMLElement;

                // Show loading, hide previous response
                llmResponseDiv.classList.add('hidden');
                loadingIndicator.classList.remove('hidden');
                llmResponseDiv.innerHTML = ''; // Clear previous content

                let prompt = '';
                switch (theoremType) {
    case 'green':
        // Prompt para o Teorema de Green: Foco em LaTeX e formatação didática.
        prompt = 'Gere um exemplo simples e conciso de aplicação do Teorema de Green, explicando os passos de forma didática. Utilize a sintaxe LaTeX correta e padrão para todas as expressões matemáticas, usando $ para inline e $$ para display. Utilize Markdown para títulos, negritos e listas. Garanta espaçamento adequado entre as palavras e uma formatação visualmente clara.';
        break;
    case 'stokes':
       prompt = 'Gere um exemplo simples e conciso de aplicação do Teorema de Stokes, explicando os passos de forma didática. Utilize a sintaxe LaTeX correta (usando \\vec{F} ou \\mathbf{F} para vetores) para todas as expressões matemáticas, usando $ para inline e $$ para display. **Para o cálculo do Rotacional (Curl), utilize o ambiente LaTeX \\begin{vmatrix} e \\end{vmatrix} para criar a matriz determinante, garantindo alinhamento e formatação visualmente clara.** Utilize Markdown para títulos, negritos e listas. **Gere texto claro e em português correto, sem concatenar palavras ou usar formatação estranha em termos.** ';
    break;
    case 'gauss':
        // Prompt para o Teorema de Gauss (já atualizado para espaçamento e itálicos):
        prompt = 'Gere um exemplo simples e conciso de aplicação do Teorema de Gauss (Teorema da Divergência), explicando os passos de forma didática. Utilize a sintaxe LaTeX correta e padrão para todas as expressões matemáticas, usando $ para inline e $$ para display. Utilize Markdown para títulos, negritos e listas. Garanta espaçamento adequado entre as palavras e evite formatar termos técnicos em itálico.';
        break;
    case 'default':
        // Prompt padrão: Foco em sintaxe LaTeX correta e formatação clara.
        prompt = 'Gere um exemplo de um teorema de cálculo vetorial. Utilize a sintaxe LaTeX correta e padrão para as expressões matemáticas, usando $ para inline e $$ para display. Utilize Markdown para títulos, negritos e listas. Garanta espaçamento adequado entre as palavras e uma formatação visualmente clara.';
        break;
}
                try {
                    // CHAMA SUA API ROUTE INTERNA NA VERCEL
                    // O Next.js roteará essa chamada para o seu arquivo api/generate/route.ts
                    const response = await fetch('/api/generate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ prompt: prompt }) // Envia o prompt para o servidor
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error('Erro na resposta da API:', response.status, errorData);
                        llmResponseDiv.innerHTML = `Erro: Não foi possível gerar o exemplo. Status: ${response.status}. Tente novamente.`;
                    } else {
                        const result = await response.json();

                        // O resultado da sua API Route (api/generate/route.ts) deve conter o texto gerado.
                        // Assumindo que a resposta JSON seja o texto em Markdown
                        const markdownText = result.text; 

                        if (markdownText) {
                            // Converte Markdown para HTML
                            const htmlContent = await marked.parse(markdownText);
                            
                            // Em React/JSX, usamos dangerouslySetInnerHTML para injetar HTML puro (necessário para a saída do Markdown)
                            llmResponseDiv.innerHTML = htmlContent as string; 

                            if (window.MathJax) {
                                // Pede ao MathJax para renderizar as equações no novo conteúdo
                                window.MathJax.typesetPromise([llmResponseDiv]); 
                            }
                        } else {
                            llmResponseDiv.innerHTML = 'Erro: Resposta inesperada da API. Tente novamente.';
                        }
                    }
                    llmResponseDiv.classList.remove('hidden'); // Make it visible
                } catch (error) {
                    console.error('Erro ao chamar a API:', error);
                    llmResponseDiv.innerHTML = 'Ocorreu um erro ao gerar o exemplo. Verifique sua conexão ou tente novamente mais tarde.';
                    llmResponseDiv.classList.remove('hidden');
                } finally {
                    loadingIndicator.classList.add('hidden');
                }
            });
        });

        // Cleanup function para remover event listeners quando o componente é desmontado
        return () => {
            buttons.forEach(button => {
                // Remover o listener para evitar problemas em navegações futuras
                // (Opcional, mas boa prática em React)
                // button.removeEventListener('click', ...); 
            });
        };

    }, []); // O array vazio garante que o useEffect rode apenas uma vez

    return (
        <>
            {/* Metadados (Opcional: O Next.js App Router usa um arquivo layout.tsx para isso) */}
            {/* Você pode remover a tag <head> do seu HTML original. */}

            {/* Configuração do MathJax e Outros Scripts Externos */}
            <Script id="mathjax-config" strategy="beforeInteractive">
                {`
                    window.MathJax = {
                        tex: {
                            inlineMath: [['$', '$'], ['\\(', '\\)']] 
                        },
                        svg: {
                            fontCache: 'global'
                        }
                    };
                `}
            </Script>
            <Script 
                id="MathJax-script" 
                strategy="lazyOnload" 
                src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js" 
            />
            {/* Usando o Script do Next.js para Tailwind e Marked.js (Se não tiver instalado via npm) */}
            <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
            <Script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js" strategy="beforeInteractive" />

            {/* O corpo da página, convertido para JSX */}
            <main className="p-4 md:p-8">
                <div className="max-w-5xl mx-auto">
                    <header className="text-center mb-10">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 theorem-title mb-4">
                            Teoremas Fundamentais do Cálculo Vetorial
                        </h1>
                        <p className="text-lg text-gray-600">
                            Uma visão interativa dos teoremas de Green, Stokes e Gauss.
                        </p>
                    </header>

                    {/* Conteúdo dos Teoremas (Convertendo class para className) */}
                    
                    {/* Teorema de Green */}
                    <section className="theorem-card border-2 border-primary-red bg-primary-red/10 rounded-2xl mb-12">
                        <h2 className="text-3xl font-bold theorem-title mb-4 text-primary-red">Teorema de Green</h2>
                        <p className="text-gray-700 leading-relaxed">
                            O Teorema de Green relaciona a integral de linha de um campo vetorial ao longo de uma curva fechada simples no plano com a integral dupla sobre a região plana delimitada por essa curva. Ele é fundamental para converter problemas de integral de linha em problemas de integral de área e vice-versa em duas dimensões.
                        </p>
                        <div className="formula mt-4">
                            {"$$ \\oint_C (P \\, dx + Q \\, dy) = \\iint_D \\left( \\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y} \\right) \\, dA $$"}
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                            Onde $C$ é uma curva fechada simples e positivamente orientada, e $D$ é a região plana delimitada por $C$. $P$ e $Q$ são funções com derivadas parciais contínuas.
                        </p>
                        <details className="mt-4">
                            <summary className="details-summary-btn">Saiba Mais sobre o Teorema de Green</summary>
                            <div className="p-4 bg-gray-50 rounded-lg mt-2 text-gray-600">
                                <p>
                                    O Teorema de Green é frequentemente usado para calcular áreas de regiões complexas ou para simplificar o cálculo de integrais de linha. Ele tem aplicações importantes em física, como no cálculo de trabalho realizado por uma força ou fluxo através de uma curva. É um caso especial do Teorema de Stokes em duas dimensões.
                                </p>
                            </div>
                        </details>
                        <div className="mt-6 text-center">
                            <button 
        // Use a nova classe CSS personalizada
        className="generate-example-btn-style generate-example-btn" 
        data-theorem="green"
    >
        Gerar Exemplo ✨
    </button>
                            <div className="llm-response mt-4 p-4 bg-light-red rounded-lg text-gray-800 text-left hidden">
                            </div>
                            <div className="loading-indicator hidden mt-2 text-primary-red">Carregando...</div>
                        </div>
                    </section>

                    {/* Teorema de Stokes */}
                    <section className="theorem-card border-2 border-primary-red bg-primary-red/10 rounded-2xl mb-12">
                        <h2 className="text-3xl font-bold theorem-title mb-4 text-primary-red">Teorema de Stokes</h2>
                        <p className="text-gray-700 leading-relaxed">
                            {`O Teorema de Stokes generaliza o Teorema de Green para três dimensões, relacionando a integral de linha de um campo vetorial ao longo de uma curva fechada $C$ a fronteira de uma superfície $S$ com a integral de superfície do rotacional (curl) desse campo sobre a superfície $S$.`}
                        </p>
                        <div className="formula mt-4">
                            {"$$ \\oint_C \\mathbf{F} \\cdot d\\mathbf{r} = \\iint_S (\\nabla \\times \\mathbf{F}) \\cdot d\\mathbf{S} $$"}
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                            {"Onde $\\mathbf{F}$ é um campo vetorial, $C$ é a fronteira orientada de uma superfície orientada $S$, e $\\nabla \\times \\mathbf{F}$ é o rotacional de $\\mathbf{F}$."}
                        </p>
                        <details className="mt-4">
                            <summary className="details-summary-btn">Saiba Mais sobre o Teorema de Stokes</summary>
                            <div className="p-4 bg-gray-50 rounded-lg mt-2 text-gray-600">
                                <p>
                                    Este teorema é crucial em eletromagnetismo, onde é usado para derivar as equações de Maxwell. Ele permite converter integrais de linha em integrais de superfície, o que pode simplificar os cálculos em muitas situações práticas envolvendo campos conservativos ou rotacionais.
                                </p>
                            </div>
                        </details>
                        <div className="mt-6 text-center">
                            <button 
        // Use a nova classe CSS personalizada
        className="generate-example-btn-style generate-example-btn" 
        data-theorem="stokes"
    >
        Gerar Exemplo ✨
    </button>
                            <div className="llm-response mt-4 p-4 bg-light-red rounded-lg text-gray-800 text-left hidden">
                            </div>
                            <div className="loading-indicator hidden mt-2 text-primary-red">Carregando...</div>
                        </div>
                    </section>

                    {/* Teorema de Gauss */}
                    <section className="theorem-card border-2 border-primary-red bg-primary-red/10 rounded-2xl mb-12">
                        <h2 className="text-3xl font-bold theorem-title mb-4 text-primary-red">Teorema de Gauss </h2>
                        <p className="text-gray-700 leading-relaxed">
                            O Teorema de Gauss, também conhecido como Teorema da Divergência, relaciona o fluxo de um campo vetorial através de uma superfície fechada $S$ com a integral tripla da divergência desse campo sobre o volume $V$ contido por $S$.
                        </p>
                        <div className="formula mt-4">
                            {"$$ \\iint_S \\mathbf{F} \\cdot d\\mathbf{S} = \\iiint_V (\\nabla \\cdot \\mathbf{F}) \\, dV $$"}
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                            {"Onde $\\mathbf{F}$ é um campo vetorial, $S$ é uma superfície fechada que delimita um volume $V$, e $\\nabla \\cdot \\mathbf{F}$ é a divergência de $\\mathbf{F}$."}
                        </p>
                        <details className="mt-4">
                            <summary className="details-summary-btn">Saiba Mais sobre o Teorema de Gauss</summary>
                            <div className="p-4 bg-gray-50 rounded-lg mt-2 text-gray-600">
                                <p>
                                    Este teorema é amplamente utilizado em física, especialmente em eletrostática e dinâmica dos fluidos, para calcular o fluxo de campos elétricos ou a vazão de fluidos através de superfícies. Ele permite converter uma integral de superfície em uma integral de volume, simplificando o cálculo em muitos casos.
                                </p>
                            </div>
                        </details>
                        <div className="mt-6 text-center">
                            <button 
        // Use a nova classe CSS personalizada
        className="generate-example-btn-style generate-example-btn" 
        data-theorem="gauss"
    >
        Gerar Exemplo ✨
    </button>
                            <div className="llm-response mt-4 p-4 bg-light-red rounded-lg text-gray-800 text-left hidden">
                            </div>
                            <div className="loading-indicator hidden mt-2 text-primary-red">Carregando...</div>
                        </div>
                    </section>

                    <footer className="text-center mt-10 text-gray-500 text-sm">
                        <p>&copy; 2025 Hevellyn ♡. Todos os direitos reservados.</p>
                    </footer>
                </div>
            </main>

            {/* Estilos CSS (Colocados no final do componente JSX usando styled-jsx (ou Next.js CSS Modules/Global Styles)) */}
            <style jsx global>{`
                body {
                    font-family: 'Inter', sans-serif;
                    background-color: #f0f4f8; 
                    color: #334155; 
                }
                .theorem-card {
                    background-color: rgba(159, 0, 43, 0.1); /* primary-red/10 */
                    border-width: 2px; /* border-2 */
                    border-style: solid;
                    border-color: #9F002B; /* border-primary-red */
                    border-radius: 1rem; /* rounded-2xl */
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                    padding: 3rem; /* Increased padding (Já estava no seu CSS original) */
                    transition: transform 0.3s ease-in-out;
                }
                
                    .generate-example-btn-style {
    background-color: #9F002B; /* primary-red */
    color: #ffffff; /* text-white */
    font-weight: bold;
    padding: 0.5rem 1rem; /* py-2 px-4 */
    border-radius: 9999px; /* rounded-full */
    
    /* Adicionando transição para o hover */
    transition-property: all;
    transition-duration: 300ms;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); /* ease-in-out */
}

/* Estilo para o hover (opcional, mas recomendado) */
.generate-example-btn-style:hover {
    background-color: #7F0022; /* dark-red */
    transform: scale(1.05); /* hover:scale-105 */
}

                .theorem-card:hover {
                    transform: translateY(-5px);
                }
                .theorem-title {
                    color: #334155; 
                }
                .formula {
                    background-color: #d791be; 
                    padding: 1rem;
                    border-radius: 0.5rem;
                    margin-top: 1rem;
                    margin-bottom: 1rem;
                }
                .details-summary-btn {
                    display: inline-block;
                    padding: 0.5rem 1rem;
                    border-radius: 9999px; 
                    background-color: #9F002B; 
                    color: white;
                    font-weight: 600;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    transition: transform 0.3s ease-in-out, background-color 0.3s ease-in-out;
                }
                .details-summary-btn:hover {
                    background-color: #7F0022; 
                    transform: scale(1.05);
                }
                details[open] summary:before {
                    content: '- ';
                }
                details > summary:before {
                    content: '+ ';
                }
                details > summary {
                    list-style: none;
                    cursor: pointer;
                }
                .loading-indicator {
                    color: #9F002B;
            }
                    .llm-response {
    /* Adicionando a sua cor de fundo e padding, se já não estiverem lá */
    background-color: #FDF0F2; /* Cor light-red (se você a moveu para cá) */
    padding: 1rem;
    border-radius: 0.5rem;
    
    /* Adiciona scroll horizontal se o conteúdo for muito largo */
    overflow-x: auto; 
    
    /* Garante que o conteúdo quebra linha se necessário (especialmente em parágrafos) */
    word-wrap: break-word; 
    word-break: break-word;
}

            `}</style>
        </>
    );
}